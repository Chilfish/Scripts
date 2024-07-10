import argparse
import json
import os
import subprocess
from datetime import datetime

import yt_dlp

# 设置参数
parser = argparse.ArgumentParser()
parser.add_argument(
    "url", 
    help="video url, or list split by ', '",
    type=str
)
parser.add_argument(
    "--no-download",
    help="don't download video",
    action="store_true"
)
parser.add_argument(
    "--gif",
    help="convert video to gif",
    action="store_true"
)
parser.add_argument(
    "--audio",
    help="download audio only",
    action="store_true"
)
args = parser.parse_args()


def main(video_url: str):
    out_dir = "D:/Downloads"
    temp_dir = os.environ.get("TEMP", out_dir)

    opt_format = "bestvideo/best+bestaudio/best"
    proxy = "http://127.0.0.1:7890"

    # starBeat 番剧画质超分辨率
    if video_url.find("bilibili.com/bangumi/play/") != -1:
        opt_format = "bestvideo[height=1080]+bestaudio/best"
        proxy = None

    if args.audio:
        opt_format = "bestaudio/best"

    # 设置下载参数
    ydl_opts = {
        "cookiesfrombrowser": ("chrome",),
        "paths": {
            "home": out_dir,
            "temp": temp_dir,
        },
        "concurrent_fragment_downloads": 16,
        "proxy": proxy,
        "format": opt_format,
    }

    ydl = yt_dlp.YoutubeDL(ydl_opts)

    info = ydl.extract_info(video_url, download=False) or {}

    title = info.get("title", "video")
    author = info.get("uploader", "unknown")
    host = info.get("extractor", "unknown")

    if host == "twitter":
        title = info.get("channel_id", author)
    elif host == "youtube":
        title = f"{author}_{title}"

    upload_date = (
        datetime.fromtimestamp(info["timestamp"]).strftime("%Y-%m-%d_%H-%M")
        if "timestamp" in info
        else info.get("upload_date", "unknown")
    )
    filename = f"{upload_date}_{title}"
    ext = "mp4"

    if host != "BiliBiliBangumi":
        filename = title
    if args.audio:
        ext = "mp3"
    ydl_opts["outtmpl"]["default"] = f"{filename}.{ext}"

    ydl.params.update(ydl_opts)

    filepath = f"{out_dir}/{upload_date}_{title}"
    print("options:", ydl.params)

    if args.no_download:
        with open(f"{out_dir}/{title}.json", "w", encoding="utf-8") as file:
            json.dump(info, file, ensure_ascii=False, indent=2)
    else:
        ydl.download([video_url])

    if args.gif:
        subprocess.run(
            [
                "ffmpeg",
                "-i",
                f"{filepath}.mp4",
                f"{filepath}.gif",
            ],
            check=True,
        )
        os.remove(f"{filepath}.mp4")


if __name__ == "__main__":
    urls = args.url.split(", ")
    for url in urls:
        main(url)
