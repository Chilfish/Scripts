$OutputEncoding = [console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding

Import-Module -Name Microsoft.WinGet.CommandNotFound

Set-PSReadLineOption -PredictionSource History
Set-PSReadlineKeyHandler -Key Tab -Function MenuComplete
Set-PSReadLineKeyHandler -Chord Tab -Function MenuComplete
Set-PSReadLineKeyHandler -Key UpArrow -ScriptBlock {
    [Microsoft.PowerShell.PSConsoleReadLine]::HistorySearchBackward()
    [Microsoft.PowerShell.PSConsoleReadLine]::EndOfLine()
}
Set-PSReadLineKeyHandler -Key DownArrow -ScriptBlock {
    [Microsoft.PowerShell.PSConsoleReadLine]::HistorySearchForward()
    [Microsoft.PowerShell.PSConsoleReadLine]::EndOfLine()
}

Invoke-Expression (&starship init powershell)
Invoke-Expression (& { (zoxide init powershell | Out-String) })

fnm env --use-on-cd | Out-String | Invoke-Expression

New-Alias git hub
New-Alias Set-LocationWithFnm z
New-Alias which Get-Command
New-Alias open start-Process

New-Alias code code-insiders
New-Alias curl D:/Scoop/shims/curl.exe

Remove-Item Alias:ni -Force -ErrorAction Ignore

$hosts = "C:\Windows\System32\drivers\etc\hosts"
$me = "C:/Users/Chilfish"
$videos = "D:/Videos"
$download = "D:/Downloads"
$scripts = "D:/Codes/Scripts"
$subl = "D:\Dev\Sublime Text\sublime_text.exe"

$Env:IS_NODE="TRUE"

# https://github.com/xampprocky/tokei
function code-count {
  tokei -s lines -e pnpm-lock.yaml $args . 
}

# nestjs/cli
function nest-gen($name) {
  nest g mo $name modules
  nest g co $name modules --no-spec 
  nest g s $name modules --no-spec 
}

# https://github.com/Chilfish/Scripts/blob/main/python/video-dlp.py
function yt {
  python $scripts/python/video-dlp.py $args
}
function ytd {
  yt-dlp --cookies-from-browser chrome -f 'bestvideo+bestaudio' -o "$videos/%(title)s.%(ext)s" $args
}

# https://github.com/Chilfish/Weibo-archiver/blob/main/scripts/server.mjs
function wb {
  $cwd = "D:/Backups/Weibo"
  node "$cwd/server.mjs" $cwd
}

# bbdown: https://github.com/nilaoda/BBDown
function danmu {
  bbdown --danmaku-only --work-dir="$videos/弹幕/" $args
  Remove-Item "$videos/弹幕/*.xml"
}
function subtitle {
  bbdown --sub-only --skip-ai=false --work-dir=$videos $args
}

$bbdownArgs = @(
  "-aria2", # 使用 Aria2 下载
  "-mt", # 多线程下载
  "-M", "<ownerName> - <videoTitle>/<pageNumber> - <pageTitle>", # 多分P文件名格式
  "-F", "<ownerName> - <videoTitle>", # 单分P文件名格式
  "--work-dir=$videos" # 下载目录
)

function downbb {
  bbdown $bbdownArgs $args
}
function downbb-low {
  downbb -e "hevc" -q "1080P 高清" $args
}

# https://github.com/eza-community/eza
function lss {
  eza -lnhaa --time-style "+%m-%d %H:%m" --no-quotes --sort type $args
}

# 查看文件夹大小
function mem {
  $res = (ls $args -recurse | measure-object length -Sum).Sum/1MB 
  echo ("{0:N3} MB" -f $res)
}

function get-filename {
  param (
    [string]$name
  )
  $basename = [System.IO.Path]::GetFileNameWithoutExtension($name)
  return $basename
}
function get-relative {
  param (
    [string]$path
  )
  $pwd = Get-Location
  $relative = [System.IO.Path]::GetRelativePath($pwd, $path).Replace("\", "/")
  return $relative
}

# ------ FFmpeg ------
$smallArgs = @(
  "-c:v", "libx264", # 使用 H.264 编码
  "-tag:v", "avc1", # 将视频流标记为 avc1
  "-movflags", "faststart", # 使视频流在播放时能够边下载边播放
  "-crf", "25", # 视频质量，值越小质量越高
  "-preset", "superfast", # 编码速度，与压缩率成反比
  "-c:a", "aac", # 使用 AAC 音频编码
  "-b:a", "192k" # 音频码率
)

function tomp4 {
  param (
    [string]$video
  )
  $basename = get-filename $video
  ffmpeg -i $video -c copy "$basename.mp4"
}
# 字幕压制，6倍速
function subMp4 {
  param (
    [string]$video,
    [string]$subtitle
  )
  cd $videos
  $basename = get-filename $video
  $subPath = get-filename $subtitle

  ffmpeg -i $video -vf "ass=$subPath.ass" $smallArgs "sub-$basename.mp4"
}
function small-mp4 {
  param(
    [string]$video
  )
  $basename = get-filename $video
  ffmpeg -i $video $smallArgs "small-$basename.mp4"
}

# get battery report
function battery {
  $Path = "$download/battery-report.html"
  powercfg /batteryreport /output $Path
}

function gitblame {
  echo "" >> .git-blame-ignore-revs
  git config --local blame.ignoreRevsFile .git-blame-ignore-revs
}

function runBg {
  param(
    [string]$command
  )
  Start-Process powershell -ArgumentList "-NoProfile -NoLogo -Command $command" -WindowStyle Hidden
}

function start-rss {
  Write-Host "running on http://localhost:1200"
  cd D:/Codes/fork/RSSHub
  runBg "pnpm start"
}
function start-rss-twitter {
  cd $scripts
  runBg "pnpm run:rss"
}
function start-wb-checkin {
  $cwd = "$scripts/cli/weibo-checkin.ts"
  runBg "tsx $cwd"
}

# sudo: https://github.com/gerardog/gsudo
function KillByPort {
  param(
    [int]$Port
  )

  $connection = Get-NetTCPConnection -LocalPort $Port -State Listen
  if ($connection) {
      $pids = $connection.OwningProcess
      Write-Host "Found process with PID: $pids on port $Port"
      sudo Stop-Process -Id $pids -Force
  } else {
      Write-Host "No process found listening on port $Port"
  }
}

function isSame {
    param (
        [string]$file1,
        [string]$file2
    )
    if (-not (Test-Path $file1)) {
        Write-Error "File $file1 does not exist."
        return
    }
    if (-not (Test-Path $file2)) {
        Write-Error "File $file2 does not exist."
        return
    }
    $hash1 = & openssl dgst -sha256 -binary $file1 | & openssl base64
    $hash2 = & openssl dgst -sha256 -binary $file2 | & openssl base64

   if ($hash1 -eq $hash2) {
        Write-Output "The files have the same hash.`n$hash1"
    } else {
        Write-Output "The files have different hashes.`n$hash1`n$hash2"
    }
}

function update-scoop {
  tsx "$scripts/cli/scoop-update.ts"
}
function ip {
  curl "ipinfo.io?token=$Env:ip_token" | jq
}
function openx {
  param([string]$str)
  if ($str -match '(\d+)$') {
    $id = $matches[1]
    $url = "https://x.com/i/status/$id"
    Start-Process $url
  }
}

function randomString($length = 16) {
  $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?`~"
  return -join ((1..$length) | ForEach-Object { $chars[(Get-Random -Minimum 0 -Maximum $chars.Length)] })
}

