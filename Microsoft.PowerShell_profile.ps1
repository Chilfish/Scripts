# Import-Module oh-my-posh 
oh-my-posh init pwsh --config "~\AppData\Local\Programs\oh-my-posh\themes\amro.omp.json" | Invoke-Expression 

fnm env --use-on-cd | Out-String | Invoke-Expression

# PSReadLine 补全模块
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

# 路径补全
# https://github.com/vors/ZLocation

# openAI
$openAPI = ''
$openKEY = ''

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
