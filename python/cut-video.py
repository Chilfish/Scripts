import argparse
import os
import subprocess

example_intervals = [
    "00:00:00,000 ---> 00:00:10,000",
    "00:00:20,000 ---> 00:00:30,000",
    "00:00:40,000 ---> 00:00:50,000",
]


def print_time_error():
    print("时间间隔信息示例:", *example_intervals, sep='\n')


def read_time_intervals(file_path):
    intervals = []
    with open(file_path, 'r', encoding="utf-8") as file:
        for line in file:
            start, end = line.strip().split(' ---> ')
            intervals.append((parse_time(start), parse_time(end)))

    # sort by start time
    intervals.sort(key=lambda x: x[0])

    return intervals


def parse_time(time_str):
    h, m, s_ms = time_str.split(':')
    s, ms = s_ms.split(',')
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def clip_video(input_path, ranges, output_path):
    keep_files = []
    for i, (start, end) in enumerate(ranges):
        temp_output = os.path.join(output_path, f"clip_{i:03d}.mp4")
        cmd = [
            "ffmpeg", 
            "-ss", str(start), # 似乎必须放在第一位参数
            "-to", str(end),
            "-i", input_path,
            "-c", "copy", temp_output
        ]
        subprocess.run(cmd, check=True)
        keep_files.append(temp_output)
    return keep_files


def cut_video(input_path, intervals, output_path, pick):
    temp_dir = os.path.join(os.path.dirname(output_path), "temp_clips")
    concat_file = os.path.join(temp_dir, "concat.txt")
    os.makedirs(temp_dir, exist_ok=True)

    if pick:
        clip_video(input_path, intervals, temp_dir)
        return

    video_duration_cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", input_path
    ]
    video_duration = float(subprocess.check_output(video_duration_cmd).strip())

    keep_segments = []
    start_of_next_segment = 0

    for start, end in intervals:
        if start_of_next_segment < start:
            keep_segments.append((start_of_next_segment, start))
        start_of_next_segment = end

    if start_of_next_segment < video_duration:
        keep_segments.append((start_of_next_segment, video_duration))

    keep_files = clip_video(input_path, keep_segments, temp_dir)

    with open(concat_file, 'w') as file:
        for keep_file in keep_files:
            file.write(f"file '{keep_file}'\n")

    concat_cmd = [
        "ffmpeg", "-f", "concat", "-safe", "0",
        "-i", concat_file, "-c", "copy", output_path
    ]
    subprocess.run(concat_cmd, check=True)

    for keep_file in keep_files:
        os.remove(keep_file)
    os.remove(concat_file)
    os.rmdir(temp_dir)


def main():
    parser = argparse.ArgumentParser(description="视频切片工具，单拎切片或者合并切片。")
    parser.add_argument("input_video", help="输入视频文件路径")
    parser.add_argument("--pick", action="store_true", help="提取并单独保存time_intervals.txt中的片段")
    args = parser.parse_args()

    videos_directory = os.path.join("F:/Videos")
    time_intervals_file = os.path.join(videos_directory, "time_intervals.txt")

    input_video_path = args.input_video
    video_name = os.path.basename(input_video_path)
    output_video_path = os.path.join(videos_directory, f"cut-{video_name}.mp4")

    if not os.path.exists(input_video_path):
        print("输入的视频文件不存在！")
        return

    if not os.path.exists(time_intervals_file):
        print(f"时间间隔文件不存在！，请先创建 {time_intervals_file} 文件，然后输入时间间隔信息。")
        print_time_error()

        with open(time_intervals_file, 'w', encoding="utf-8") as file:
            file.write("\n".join(example_intervals))
        return

    intervals = read_time_intervals(time_intervals_file)
    if not intervals:
        print("时间间隔文件中没有时间间隔信息！")
        print_time_error()
        return

    print(intervals)
    cut_video(args.input_video, intervals, output_video_path, args.pick)

    if args.pick:
        print(f"视频片段提取完成，片段保存在: {os.path.join(os.path.dirname(output_video_path), 'temp_clips')}")
    else:
        print(f"视频处理完成，输出文件位于: {output_video_path}")


if __name__ == "__main__":
    main()
