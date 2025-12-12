import fs from 'node:fs'
// Interfaces provided by the user
import { URL } from 'node:url'
import jsonData from '../data/playlist.json'

export interface Root {
  clip_id: string
  base_url: string
  video: Video[]
  audio: Audio[]
}

export interface Video {
  id: string
  avg_id: string
  base_url: string
  format: string
  mime_type: string
  codecs: string
  bitrate: number
  avg_bitrate: number
  duration: number
  framerate: number
  width: number
  height: number
  max_segment_duration: number
  init_segment: string
  init_segment_url: string
  index_segment: string
  segments: Segment[]
}

export interface Segment {
  start: number
  end: number
  url: string
  size: number
}

export interface Audio {
  id: string
  avg_id: string
  base_url: string
  format: string
  mime_type: string
  codecs: string
  bitrate: number
  avg_bitrate: number
  duration: number
  channels: number
  sample_rate: number
  max_segment_duration: number
  init_segment: string
  init_segment_url: string
  index_segment: string
  segments: Segment2[]
  audio_primary: boolean
}

export interface Segment2 {
  start: number
  end: number
  url: string
  size: number
} // Using Node.js built-in URL module for robust URL joining

/**
 * @description Generates HLS (M3U8) playlists from a given JSON media description.
 * @param {Root} data - The root object containing video and audio stream information.
 * @returns {{ [filename: string]: string }} An object where keys are suggested filenames
 *                                          (e.g., "master.m3u8", "video_1080p.m3u8")
 *                                          and values are the corresponding M3U8 content.
 */
export function generateM3U8Playlists(data: Root): { [filename: string]: string } {
  const playlists: { [filename: string]: string } = {}
  const audioGroupId = 'audio-group' // A common group ID for all audio renditions
  const baseUrl = 'https://vod-adaptive-ak.vimeocdn.com/exp=1761749096~acl=%2Fefc3fa61-c44d-47b1-a0d9-c7daf0e18d3d%2F%2A~hmac=335fef6b8ef299c92eaa0c9e674af0c34d78ec08144a4d8151cef1383c57643a/efc3fa61-c44d-47b1-a0d9-c7daf0e18d3d/v2/range/prot/'

  // --- 1. Generate Media Playlists for each Audio Stream ---
  const audioPlaylistUrls: { [id: string]: string } = {}
  data.audio.forEach((audioStream) => {
    const filename = `audio_${audioStream.id}.m3u8`
    audioPlaylistUrls[audioStream.id] = filename
    playlists[filename] = generateMediaPlaylist(audioStream, baseUrl)
  })

  // --- 2. Generate Media Playlists for each Video Stream ---
  const videoPlaylistUrls: { [id: string]: string } = {}
  data.video.forEach((videoStream) => {
    const filename = `video_${videoStream.height}p_${Math.round(videoStream.bitrate / 1000)}k.m3u8`
    videoPlaylistUrls[videoStream.id] = filename
    playlists[filename] = generateMediaPlaylist(videoStream, baseUrl)
  })

  // --- 3. Generate the Master Playlist ---
  playlists['master.m3u8'] = generateMasterPlaylist(data, audioGroupId, audioPlaylistUrls, videoPlaylistUrls)

  return playlists
}

/**
 * @private
 * @description Generates a single media playlist for a video or audio stream.
 * @param {Video | Audio} stream - The stream data.
 * @param {string} rootBaseUrl - The root base URL for resolving segment URLs.
 * @returns {string} The content of the media M3U8 playlist.
 */
function generateMediaPlaylist(stream: Video | Audio, rootBaseUrl: string): string {
  const lines: string[] = []
  lines.push('#EXTM3U')
  // HLS version 7 is a safe choice for features like EXT-X-MAP and floating-point durations.
  lines.push('#EXT-X-VERSION:7')

  // Use Math.ceil as per HLS specification for TARGETDURATION (must be an integer).
  const targetDuration = Math.ceil(stream.max_segment_duration)
  lines.push(`#EXT-X-TARGETDURATION:${targetDuration}`)
  lines.push('#EXT-X-PLAYLIST-TYPE:VOD')

  // Handle the initialization segment using a Data URI for self-containment.
  // This is a critical step to convert the Base64 init segment into a usable format for HLS.
  if (stream.init_segment) {
    const mapUri = `data:${stream.mime_type};base64,${stream.init_segment}`
    lines.push(`#EXT-X-MAP:URI="${mapUri}"`)
  }

  // Add all media segments
  stream.segments.forEach((segment) => {
    const duration = segment.end - segment.start
    // Use toFixed(6) for high precision on segment durations.
    lines.push(`#EXTINF:${duration.toFixed(6)},`)

    // Construct the absolute URL for the segment.
    // The stream might have its own base_url, which is relative to the root_base_url.
    // The segment url is relative to the stream's base_url.
    // Using the URL constructor handles joining these parts correctly.
    const streamBase = new URL(stream.base_url, rootBaseUrl).href
    const absoluteUrl = new URL(segment.url, streamBase).href
    lines.push(absoluteUrl)
  })

  lines.push('#EXT-X-ENDLIST')

  return lines.join('\n')
}

/**
 * @private
 * @description Generates the master playlist that links to all media playlists.
 * @param {Root} data - The root data object.
 * @param {string} audioGroupId - The group ID to associate audio tracks.
 * @param {{ [id: string]: string }} audioPlaylistUrls - Map of audio stream ID to its playlist filename.
 * @param {{ [id: string]: string }} videoPlaylistUrls - Map of video stream ID to its playlist filename.
 * @returns {string} The content of the master M3U8 playlist.
 */
function generateMasterPlaylist(
  data: Root,
  audioGroupId: string,
  audioPlaylistUrls: { [id: string]: string },
  videoPlaylistUrls: { [id: string]: string },
): string {
  const lines: string[] = []
  lines.push('#EXTM3U')
  lines.push('#EXT-X-VERSION:7')

  // Find the primary audio track to correctly populate the combined CODECS attribute later.
  const primaryAudio = data.audio.find(a => a.audio_primary) || data.audio[0]

  if (primaryAudio) {
    const lastSegment = primaryAudio.segments[primaryAudio.segments.length - 1]
    const segmentsTotalDuration = lastSegment.end
    const declaredDuration = primaryAudio.duration
    console.log(`Audio declared duration: ${declaredDuration}`)
    console.log(`Audio segments calculated end time: ${segmentsTotalDuration}`)
  }

  // --- Define Audio Renditions using #EXT-X-MEDIA ---
  data.audio.forEach((audio) => {
    const mediaTag = [
      `TYPE=AUDIO`,
      `GROUP-ID="${audioGroupId}"`,
      `NAME="${audio.id}"`, // Using ID as name, could be replaced with a language name if available
      `DEFAULT=${audio.audio_primary ? 'YES' : 'NO'}`,
      `AUTOSELECT=YES`,
      `LANGUAGE="und"`, // "undetermined" as language is not in the source JSON
      `URI="${audioPlaylistUrls[audio.id]}"`,
    ]
    lines.push(`#EXT-X-MEDIA:${mediaTag.join(',')}`)
  })

  // --- Define Video+Audio Streams using #EXT-X-STREAM-INF ---
  data.video.forEach((video) => {
    const streamInfoTag = [
      `BANDWIDTH=${video.bitrate}`,
      `AVERAGE-BANDWIDTH=${video.avg_bitrate}`,
      // The CODECS attribute should list both video and audio codecs.
      // We pair each video rendition with the primary audio codec for this tag.
      `CODECS="${video.codecs},${primaryAudio ? primaryAudio.codecs : ''}"`,
      `RESOLUTION=${video.width}x${video.height}`,
      `FRAME-RATE=${video.framerate.toFixed(3)}`,
      // Link this video stream to the audio group defined above.
      `AUDIO="${audioGroupId}"`,
    ]
    lines.push(`#EXT-X-STREAM-INF:${streamInfoTag.join(',')}`)
    lines.push(videoPlaylistUrls[video.id])
  })
  // 对有问题的音频流进行检查
  checkSegmentContinuity(primaryAudio)

  return lines.join('\n')
}

// Assuming you have the full JSON data in a variable named `fullMediaData`
// For demonstration, I'll construct a minimal but complete object based on your snippets.
const fullMediaData: Root = jsonData

function validateStreamDurations(data: Root): void {
  const videoDuration = data.video[0]?.duration || 0
  data.audio.forEach((audioStream, index) => {
    const audioDuration = audioStream.duration
    const diff = Math.abs(videoDuration - audioDuration)
    if (diff > 0.5) { // 允许1秒内的误差
      console.warn(`[Validation Warning] Audio stream ${index} (ID: ${audioStream.id}) duration (${audioDuration}s) differs significantly from video duration (${videoDuration}s). Difference: ${diff.toFixed(3)}s.`)
    }
  })
}

validateStreamDurations(fullMediaData)

function checkSegmentContinuity(stream: Video | Audio): void {
  for (let i = 0; i < stream.segments.length - 1; i++) {
    const currentSegment = stream.segments[i]
    const nextSegment = stream.segments[i + 1]
    // 使用一个小的容差值 (epsilon) 来比较浮点数
    const epsilon = 1e-5
    if (Math.abs(currentSegment.end - nextSegment.start) > epsilon) {
      console.warn(`[Continuity Warning] Gap detected in stream ${stream.id} between segment ${i} and ${i + 1}.`)
      console.warn(`  - Segment ${i} ends at: ${currentSegment.end}`)
      console.warn(`  - Segment ${i + 1} starts at: ${nextSegment.start}`)
    }
  }
}

const generatedPlaylists = generateM3U8Playlists(fullMediaData)

// Now you can write these to files or serve them via an HTTP server
for (const filename in generatedPlaylists) {
  // Example of writing to disk:
  fs.writeFileSync(`./data/${filename}`, generatedPlaylists[filename])
}
