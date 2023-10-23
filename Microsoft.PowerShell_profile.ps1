# Import-Module oh-my-posh 
# oh-my-posh init pwsh --config "~\AppData\Local\Programs\oh-my-posh\themes\amro.omp.json" | Invoke-Expression 

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

function which {
  param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Command
  )

  Get-Command $Command | Select-Object -ExpandProperty Path
}

# npm/treer
function tree { 
  treer -i "/(.?\/?node_modules|.?\/?dist|.?\/?.git|.?\/?out|.?\/?build|.?\/?.idea|.vscode|.?\/?debug|.?\/?.gradle)/" -d $args
}

function mem {
  "" + (ls $args -recurse | measure-object length -Sum).Sum/1MB + " MB"
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

  git init; gum use Chill; git add .
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

Invoke-Expression (&starship init powershell)
Invoke-Expression (& { (zoxide init powershell | Out-String) })
fnm env --use-on-cd | Out-String | Invoke-Expression