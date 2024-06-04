import argparse
import json
from datetime import datetime

import yt_dlp

# 设置参数
parser = argparse.ArgumentParser()
parser.add_argument("url", help="video url")
parser.add_argument(
    "--no-download",
    help="don't download video",
    action="store_true"
)
args = parser.parse_args()

out_dir = "D:/Downloads"

# 设置下载参数
ydl_opts = {
    "cookiesfrombrowser": ("chrome",),
    "paths": {
        "home": out_dir,
        "temp": out_dir
    },
    "concurrent_fragment_downloads": 16,
    "format": "bestvideo+bestaudio",
    "proxy": "http://127.0.0.1:7890",
}

# 视频链接
video_url = args.url

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
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

    ydl_opts["outtmpl"]["default"] = f"{upload_date}_{title}.mp4"
    ydl.params.update(ydl_opts)

    print(ydl_opts)

    if args.no_download:
        with open(f"{out_dir}/{title}.json", "w", encoding="utf-8") as file:
            json.dump(info, file, ensure_ascii=False, indent=2)
    else:
        ydl.download([video_url])
