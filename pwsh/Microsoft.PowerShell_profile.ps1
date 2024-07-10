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

New-Alias git hub
New-Alias Set-LocationWithFnm z
New-Alias which Get-Command

New-Alias code code-insiders
New-Alias curl D:/Scoop/shims/curl.exe

# New-Alias pnpm D:\Dev\Node\pnpm\pnpm.CMD
# New-Alias pnpx D:\Dev\Node\pnpm\pnpx.CMD
Remove-Item Alias:ni -Force -ErrorAction Ignore

$hosts = "C:\Windows\System32\drivers\etc\hosts"
$me = "C:/Users/Chilfish"
$video = "D:/Videos"
$download = "D:/Downloads"
$scripts = "D:/Codes/Scripts"

$Env:OLLAMA_ORIGINS="https://lobe.chilfish.top"

# like `wc` in linux
function wc {
    param (
        [Parameter(ValueFromPipeline=$true, ValueFromPipelineByPropertyName=$true)]
        [string]$Text
    )
    begin {
        $wordCount = 0
    }
    process {
        $wordCount += ($Text -split '\s+' | Where-Object { $_ -ne '' }).Count
    }
    end {
        $wordCount
    }
}

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

# https://github.com/Chilfish/Weibo-archiver/blob/main/scripts/server.mjs
function wb {
  $cwd = "D:/Backups/Weibo"
  node "$cwd/server.mjs" $cwd
}

# bbdown: https://github.com/nilaoda/BBDown
function danmu {
  bbdown --danmaku-only --work-dir="$video/弹幕/" $args
  rm -r "$video/弹幕/*.xml"
}
function subtitle {
  bbdown --sub-only --skip-ai=false --work-dir=$video $args
}
function downbb {
  bbdown -aria2 -mt --aria2c-args="-x16 -s16 -j16" --work-dir=$video $args
}
function downbb-low {
  bbdown -mt -e "hevc" -q "1080P 高清" --work-dir=$video $args
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

function tomp4 {
  $name = $args[0]
  $basename = [System.IO.Path]::GetFileNameWithoutExtension($name)
  ffmpeg -i $name -c copy "$basename.mp4"
}

# 字幕压制
function subMp4 {
  $video = $args[0]
  $subtitle = $args[1]
  ffmpeg -i $video -vf "ass=$subtitle" -c:v libx264 -crf 23 -c:a aac -b:a 192k output.mp4
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

function runCommand {
  param(
    [string]$command
  )
  Start-Process powershell -ArgumentList "-NoProfile -NoLogo -Command $command" -WindowStyle Hidden
}

function start-rss {
  Write-Host "running on http://localhost:3456"
  cd $scripts
  runCommand "pnpm run:rss"
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

#f45873b3-b655-43a6-b217-97c00aa0db58 PowerToys CommandNotFound module

Import-Module -Name Microsoft.WinGet.CommandNotFound
#f45873b3-b655-43a6-b217-97c00aa0db58
