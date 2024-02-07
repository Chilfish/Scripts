# 设置源文件夹和目标文件夹路径
$sourceFolder = "D:\Videos\MyGo\go-lang\ai喜多"
$targetFolder = "D:\Videos\MyGo\go-lang\ai喜多"

# 获取源文件夹中的所有视频文件
$videos = Get-ChildItem -Path $sourceFolder -Filter *.mp4 -File -Recurse

echo "共有" $videos.Count "个视频文件"

$audioQuality = 0  # 设置为与视频相同的质量
$threads = 4      # 设置线程数为4

# 遍历每个视频文件并提取为MP3文件
foreach ($video in $videos) {
    $targetFile = Join-Path -Path $targetFolder -ChildPath ($video.BaseName + ".mp3")
    ffmpeg -i $video.FullName -vn -acodec libmp3lame -q:a $audioQuality -threads $threads $targetFile
}
