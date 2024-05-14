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
New-Alias code code-insiders
New-Alias curl D:/Scoop/shims/curl.exe
New-Alias which Get-Command
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

function code-count {
    tokei -s lines -e pnpm-lock.yaml $args . 
}

function nest-gen($name) {
  nest g mo $name modules
  nest g co $name modules --no-spec 
  nest g s $name modules --no-spec 
}

function yt {
   python D:/Codes/Python/learn-python/video-dlp.py $args
}

function wb {
  $cwd = "D:/Backups/Weibo"
  node "$cwd/server.mjs" $cwd
}

function danmu {
  bbdown $args --danmaku-only --work-dir=D:/videos
  rm -r D:/videos/*.xml
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

function dirr{
  mkdir $args
  cd $args
}

function du($dir = ".") {
  gci $dir -e .git, node_modules | 
  %{$f=$_; gci -r $_.Name -e .git, node_modules | 
    measure-object -property length -sum |
    select  @{Name="Name"; Expression={$f}}, 
            @{Name="Sum (MB)"; 
            Expression={"{0:N3}" -f ($_.sum / 1MB) }}, Sum } |
  sort Sum -desc |
  format-table -Property Name,"Sum (MB)", Sum -autosize
}

function gc1 {
  param(
      [Parameter(Mandatory=$true)]
      [string]$user,
      [Parameter(Mandatory=$true)]
      [string]$repo,
      
      [string]$dir=$repo
  )
  try {
    git clone --depth=1 "https://ghproxy.com/https://github.com/$user/$repo.git" $dir
    cd $dir
  } catch {
    Write-Host "Git clone failed. Exiting..."
    return  
  }
  Remove-Item -Recurse -Force .git

  git init
  git add .
}

function cp1 {
    param(
        [Parameter(Mandatory=$true)]
        [string]$From,
        
        [Parameter(Mandatory=$true)]
        [string]$To
    )

    # 复制并覆盖文件夹
    Copy-Item -Path $From -Destination $To -Recurse -Force -Exclude node_modules, .git, out
}

function pyDep {
  $list = pipdeptree --python=.venv/scripts/python.exe -l -d=0
  echo $list
  echo $list > requirements.txt
}

Invoke-Expression (&starship init powershell)
Invoke-Expression (& { (zoxide init powershell | Out-String) })
fnm env --use-on-cd | Out-String | Invoke-Expression
