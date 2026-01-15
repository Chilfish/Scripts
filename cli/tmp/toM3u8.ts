import { URL } from 'url';
import * as fs from 'fs';
import * as path from 'path';

export interface Root {
  clip_id: string;
  base_url: string;
  video: Video[];
  audio: Audio[];
}

export interface Video {
  id: string;
  base_url: string;
  format: string;
  mime_type: string;
  codecs: string;
  bitrate: number;
  avg_bitrate: number;
  duration: number;
  framerate: number;
  width: number;
  height: number;
  max_segment_duration: number;
  init_segment: string;
  segments: Segment[];
}

export interface Audio extends Omit<Video, 'width' | 'height' | 'framerate' | 'segments'> {
  channels: number;
  sample_rate: number;
  segments: Segment[];
  audio_primary: boolean;
}

export interface Segment {
  start: number;
  end: number;
  url: string;
  size: number;
}

// ==========================================
// 2. 核心转换逻辑
// ==========================================

export function generateM3U8Playlists(data: Root): { [filename: string]: string } {
  // 运行健康检查 (保留之前的逻辑)
  runHealthCheck(data);

  const playlists: { [filename: string]: string } = {};
  const AUDIO_GROUP_ID = 'audio-group';
  const audioMap: { [id: string]: string } = {};
  const videoMap: { [id: string]: string } = {};

  // --- 1. 生成音频 M3U8 (命名已优化) ---
  data.audio.forEach(track => {
    // 修复命名：使用 audio_{码率}k.m3u8，如果码率重复则回退到 ID
    const kbps = Math.round(track.bitrate / 1000);
    const filename = `audio_${kbps}k.m3u8`;

    // 防止不同 ID 但码率相同的冲突
    const finalFilename = playlists[filename] ? `audio_${track.id}.m3u8` : filename;

    audioMap[track.id] = finalFilename;
    playlists[finalFilename] = createMediaPlaylist(track, data.base_url);
  });

  // --- 2. 生成视频 M3U8 ---
  data.video.forEach(track => {
    const kbps = Math.round(track.bitrate / 1000);
    const filename = `video_${track.height}p_${kbps}k.m3u8`;
    videoMap[track.id] = filename;
    playlists[filename] = createMediaPlaylist(track, data.base_url);
  });

  // --- 3. 生成 Master M3U8 ---
  playlists['master.m3u8'] = createMasterPlaylist(data, AUDIO_GROUP_ID, audioMap, videoMap);

  return playlists;
}

/**
 * 智能 URL 拼接器
 * 解决 410 Gone 问题：确保 BaseURL 里的鉴权参数被继承到 Segment URL 上
 */
function resolveSegmentUrl(rootBase: string, streamBaseRel: string, segmentRel: string): string {
  // 1. 合并 Root Base 和 Stream Base
  // 注意：如果 rootBase 带有 query params，普通的 new URL() 会在合并相对路径时丢弃它们
  // 所以我们得先处理路径，最后再把参数补回来

  const rootUrlObj = new URL(rootBase);
  const rootParams = rootUrlObj.searchParams; // 保存 Root 的 Token

  // 计算 Stream 的绝对路径 (此时可能会丢失 root 的 params)
  const streamUrlObj = new URL(streamBaseRel, rootUrlObj);

  // 计算 Segment 的绝对路径
  const finalUrlObj = new URL(segmentRel, streamUrlObj);

  // --- 关键修复 ---
  // 将 Root URL 中的 Query Params (如 pathsig, exp) 强制合并回最终 URL
  rootParams.forEach((value, key) => {
    if (!finalUrlObj.searchParams.has(key)) {
      finalUrlObj.searchParams.set(key, value);
    }
  });

  return finalUrlObj.toString();
}

function createMediaPlaylist(stream: Video | Audio, rootBaseUrl: string): string {
  const lines: string[] = [];
  lines.push('#EXTM3U');
  lines.push('#EXT-X-VERSION:7');
  lines.push(`#EXT-X-TARGETDURATION:${Math.ceil(stream.max_segment_duration)}`);
  lines.push('#EXT-X-PLAYLIST-TYPE:VOD');

  if (stream.init_segment) {
    const mapUri = `data:${stream.mime_type};base64,${stream.init_segment}`;
    lines.push(`#EXT-X-MAP:URI="${mapUri}"`);
  }

  stream.segments.forEach(seg => {
    const duration = seg.end - seg.start;

    // 使用新的智能拼接函数
    const absUrl = resolveSegmentUrl(rootBaseUrl, stream.base_url, seg.url);

    lines.push(`#EXTINF:${duration.toFixed(6)},`);
    lines.push(absUrl);
  });

  lines.push('#EXT-X-ENDLIST');
  return lines.join('\n');
}

function createMasterPlaylist(
  data: Root,
  groupId: string,
  audioMap: { [id: string]: string },
  videoMap: { [id: string]: string }
): string {
  const lines: string[] = [];
  lines.push('#EXTM3U');
  lines.push('#EXT-X-VERSION:7');

  const primaryAudio = data.audio.find(a => a.audio_primary) || data.audio[0];

  // 音频组
  data.audio.forEach(a => {
    const filename = audioMap[a.id];
    const attrs = [
      `TYPE=AUDIO`,
      `GROUP-ID="${groupId}"`,
      `NAME="${Math.round(a.bitrate/1000)}k"`, // Name 也改用码率
      `DEFAULT=${a.audio_primary ? 'YES' : 'NO'}`,
      `AUTOSELECT=YES`,
      `URI="${filename}"`
    ];
    lines.push(`#EXT-X-MEDIA:${attrs.join(',')}`);
  });

  // 视频流
  data.video.forEach(v => {
    const codecs = [v.codecs, primaryAudio?.codecs].filter(Boolean).join(',');
    const filename = videoMap[v.id];
    const attrs = [
      `BANDWIDTH=${v.bitrate}`,
      `AVERAGE-BANDWIDTH=${v.avg_bitrate}`,
      `CODECS="${codecs}"`,
      `RESOLUTION=${v.width}x${v.height}`,
      `FRAME-RATE=${v.framerate.toFixed(3)}`,
      `AUDIO="${groupId}"`
    ];
    lines.push(`#EXT-X-STREAM-INF:${attrs.join(',')}`);
    lines.push(filename);
  });

  return lines.join('\n');
}

// 简单的健康检查 (精简版)
function runHealthCheck(data: Root) {
  if (!data.video.length) return;
  const ref = data.video[0].duration;
  data.audio.forEach(a => {
    if (Math.abs(ref - a.duration) > 1.0) {
      console.warn(`[警告] 音频 ${a.id} 时长不匹配: 视频=${ref}s, 音频=${a.duration}s`);
    }
  });
}


try {
  const rawData = fs.readFileSync('data/playlist.json', 'utf-8');
  const data: Root = JSON.parse(rawData);

  const outputFiles = generateM3U8Playlists(data);

  const outDir = 'data/m3u8';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  Object.entries(outputFiles).forEach(([name, content]) => {
    fs.writeFileSync(path.join(outDir, name), content);
    console.log(`已生成: ${name}`);
  });

} catch (e) {
  console.error("处理失败:", e);
}
