$OutputEncoding = [console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding

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

Remove-Item Alias:ni -Force -ErrorAction Ignore
Remove-Item Alias:conda -Force -ErrorAction Ignore

New-Alias git hub
New-Alias Set-LocationWithFnm z
New-Alias which Get-Command
New-Alias open start-Process
New-Alias code code-insiders.cmd
New-Alias py uv
New-Alias pyx uvx

New-Alias pnpm "D:/Scoop/shims/pnpm"
New-Alias bash "D:/Scoop/shims/bash.exe"
New-Alias vscode "D:/Dev/VSCode/bin/code.cmd"
New-Alias curl D:/Scoop/shims/curl.exe
New-Alias java8 "C:/Program Files (x86)/Common Files/Oracle/Java/java8path/java.exe"

$hosts = "C:/Windows/System32/drivers/etc/hosts"
$me = "C:/Users/Chilfish"
$videos = "F:/Videos"
$download = "$me/Downloads"
$scripts = "H:/Scripts"
$proxy = "http://127.0.0.1:7890"

$Env:IS_NODE="TRUE"
$Env:PROXY=$proxy

$Env:PATH += ";D:/Dev/Sublime Merge;C:/Users/Chilfish/.local/bin;"
$Env:EDITOR = "D:/Scoop/shims/nvim.exe"

# https://github.com/xampprocky/tokei
function codeCount {
  tokei -s lines -e pnpm-lock.yaml $args . 
}

# https://github.com/Chilfish/Scripts/blob/main/python/video-dlp.py
function yt {
  uv run $scripts/python/video-dlp.py $args
}

# https://github.com/yt-dlp/yt-dlp#readme
function ytd {
  $_args = @(
    "--cookies", "$me/cookies.txt",
    "-o", "$videos/%(title)s.mp4"
    "--remux-video", "mp4"
  )

  & yt-dlp $_args $args
}

# https://github.com/nilaoda/N_m3u8DL-RE
function m3u8 {
  $_args = @(
    "--save-dir=$videos",
    "--download-retry-count", "5",
    "--thread-count", "16",
    "--mux-after-done", "format=mp4"
    "--check-segments-count",
    "--live-pipe-mux"
    "--select-video", 'for=best',
    "--select-audio", "for=best"
  )
  & "D:/Apps/N_m3u8DL-RE.exe" $_args $args
}

# https://github.com/Chilfish/Weibo-archiver/blob/main/scripts/server.mjs
function wb {
  $cwd = "F:/Backups/Weibo"
  node "$cwd/server.mjs" $cwd
}

# bbdown: https://github.com/nilaoda/BBDown
$bbdownArgs = @(
  "-mt", # 多线程下载
  "-M", "<ownerName> - <videoTitle>/<pageNumber> - <pageTitle>", # 多分P文件名格式
  "-F", "<ownerName> - <videoTitle>", # 单分P文件名格式
  "--work-dir=$videos" # 下载目录
)

function downbb {
  bbdown $bbdownArgs $args
}
function downbbLow {
  downbb -e "hevc" -q "1080P 高清" $args
}
function bangumi {
  downbb -q "1080P 高码率, 1080P 高帧率" $args
}

function danmu {
  bbdown --danmaku-only --work-dir="$videos/弹幕/" $args
  Remove-Item "$videos/弹幕/*.xml"
}
function subtitle {
  bbdown --sub-only --skip-ai=false --work-dir=$videos $args
}

# https://github.com/eza-community/eza
function lss {
  eza -lnhaa --time-style "+%m-%d %H:%m" --no-quotes --sort type $args
}

# 查看文件夹大小
function mem {
  $res = (Get-ChildItem $args -recurse | measure-object length -Sum).Sum/1MB 
  Write-Output ("{0:N3} MB" -f $res)
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
  Set-Location $videos
  $basename = get-filename $video
  $subPath = get-filename $subtitle

  ffmpeg -i $video -vf "ass=$subPath.ass" $smallArgs "sub-$basename.mp4"
}
function smallMp4 {
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
  Write-Output "" >> .git-blame-ignore-revs
  git config --local blame.ignoreRevsFile .git-blame-ignore-revs
}

function runBg {
  param(
    [string]$command,
    [string]$name = "powershell"
  )

  $logDir = "D:/logs"
  $stdOutLog = Join-Path $logDir "$name.log"
  $stdErrLog = Join-Path $logDir "$name.error.log"

  $processOptions = @{
    FilePath = "powershell"
    WindowStyle = "Hidden"
    RedirectStandardOutput = $stdOutLog
    RedirectStandardError = $stdErrLog
    ArgumentList = @(
      "-NoProfile",
      "-NoLogo",
      "-Command",
      $command
    )
  }

  Start-Process @processOptions
}


function start-rss {
  Write-Host "running on http://localhost:1200"
  Set-Location D:/Codes/fork/RSSHub
  runBg "pnpm start"
}
function start-rss-twitter {
  Set-Location $scripts
  runBg "pnpm run:rss"
}
function start-wb-checkin {
  $cwd = "$scripts/dist/weibo-checkin.js"
  runBg "node $cwd"
}

function checkPort {
  param(
    [int]$Port
  ) 
  $connection = Get-NetTCPConnection -LocalPort $Port -State Listen
  $pids = $null
  if ($connection) {
      $pids = $connection.OwningProcess
      Write-Host "Found process with PID: $pids on port $Port"
  } else {
      Write-Host "No process found listening on port $Port"
  }
  return $pids
}

# sudo: https://github.com/gerardog/gsudo
function KillByPort {
  param(
    [int]$Port
  )

  $pids = checkPort($Port)
  if ($pids) {
    gsudo Stop-Process -Id $pids -Force
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
  curl -x $proxy "https://ipinfo.io?token=$Env:ip_token"
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

function y {
    $tmp = [System.IO.Path]::GetTempFileName()
    yazi $args --cwd-file="$tmp"
    $cwd = Get-Content -Path $tmp
    if (-not [String]::IsNullOrEmpty($cwd) -and $cwd -ne $PWD.Path) {
        Set-Location -LiteralPath $cwd
    }
    Remove-Item -Path $tmp
}

function New-Symlink {
    param (
        [string]$TargetPath,
        [string]$LinkPath
    )

    # 检查目标路径是否存在
    if (!(Test-Path -Path $TargetPath)) {
        Write-Error "目标路径 '$TargetPath' 不存在."
        return $false
    }

    # 检查软链接是否已经存在
    if (Test-Path -Path $LinkPath) {
        Write-Error "软链接 '$LinkPath' 已经存在."
        return $false
    }

    # 创建软链接
    try {
        New-Item -ItemType SymbolicLink -Path $LinkPath -Target $TargetPath
        Write-Host "成功创建软链接: '$LinkPath' -> '$TargetPath'"
        return $true
    }
    catch {
        Write-Error "创建软链接失败: $($_.Exception.Message)"
        return $false
    }
}

#f45873b3-b655-43a6-b217-97c00aa0db58 PowerToys CommandNotFound module

Import-Module -Name Microsoft.WinGet.CommandNotFound
#f45873b3-b655-43a6-b217-97c00aa0db58
