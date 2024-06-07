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

New-Alias git hub
New-Alias Set-LocationWithFnm z
# New-Alias Get-Content bat
New-Alias which Get-Command

New-Alias code code-insiders
New-Alias curl D:/Scoop/shims/curl.exe

New-Alias pnpm  D:\Dev\Node\pnpm\pnpm.CMD
New-Alias pnpx  D:\Dev\Node\pnpm\pnpx.CMD
Remove-Item Alias:ni -Force -ErrorAction Ignore

$hosts = "C:\Windows\System32\drivers\etc\hosts"
$me = "C:/Users/Chilfish"

$Env:OLLAMA_ORIGINS="https://chatkit.app"

# wsl from ssh
function wsll {
  & 'C:\Program Files\WSL\wsl.exe'
}

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

function code-count {
  # https://github.com/xampprocky/tokei
  tokei -s lines -e pnpm-lock.yaml $args . 
}

function nest-gen($name) {
  # nestjs/cli
  nest g mo $name modules
  nest g co $name modules --no-spec 
  nest g s $name modules --no-spec 
}

function yt {
  # https://github.com/Chilfish/Scripts/blob/main/python/video-dlp.py
  python D:/Codes/Scripts/python/video-dlp.py $args
}

function wb {
  # https://github.com/Chilfish/Weibo-archiver/blob/main/scripts/server.mjs
  $cwd = "D:/Backups/Weibo"
  node "$cwd/server.mjs" $cwd
}

function danmu {
  # https://github.com/nilaoda/BBDown
  bbdown $args --danmaku-only --work-dir=D:/videos
  rm -r D:/videos/*.xml
}
function subtitle {
  bbdown --sub-only --skip-ai=false --work-dir=D:/videos $args
}

function ya {
    $tmp = [System.IO.Path]::GetTempFileName()
    yazi $args --cwd-file="$tmp"
    $cwd = Get-Content -Path $tmp
    if (-not [String]::IsNullOrEmpty($cwd) -and $cwd -ne $PWD.Path) {
        Set-Location -Path $cwd
    }
    Remove-Item -Path $tmp
}

function lss {
  # https://github.com/eza-community/eza
  eza -lnhaa --time-style "+%m-%d %H:%m" --no-quotes --sort type $args
}

# github-copilot-cli aliases
function ?? {
  github-copilot-cli what-the-shell $args
}

function git? {
  github-copilot-cli git-assist $args
}

function gh? {
  github-copilot-cli gh-assist $args
}

function mem {
  $res = (ls $args -recurse | measure-object length -Sum).Sum/1MB 
  echo ("{0:N3} MB" -f $res)
}

# clone a repo and init it
function gc1 {
  param(
      [Parameter(Mandatory=$true)]
      [string]$user,
      [Parameter(Mandatory=$true)]
      [string]$repo,
      
      [string]$dir=$repo
  )
  try {
    git clone --depth=1 "https://github.com/$user/$repo.git" $dir
    cd $dir
    Remove-Item -Recurse -Force .git

    git init
    git add .
  } catch {
    Write-Host "Git clone failed. Exiting..."
    return  
  }
}

function tomp4 {
  $name = $args[0]
  ffmpeg -i $name -c copy "$name.mp4"
}

function battery {
  $Path = "D:/battery-report.html"
  powercfg /batteryreport /output $Path
}

Invoke-Expression (&starship init powershell)
Invoke-Expression (& { (zoxide init powershell | Out-String) })
fnm env --use-on-cd | Out-String | Invoke-Expression
