$inputDir = "D:\Videos\mygo12th"
$outputFile = "D:\Videos\bili\mygo12th.mp4"

Get-ChildItem -Path $inputDir -Filter *.mp4 `
 | ForEach-Object { "file '" + $_.FullName + "'" } `
 | Out-File -Encoding utf8 -FilePath files.txt

ffmpeg -f concat -safe 0 -i files.txt -c copy -y $outputFile
