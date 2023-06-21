if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
  Write-Output "admit need";
  exit;
  # $arguments = "& '" +$myinvocation.mycommand.definition + "'"
  # Start-Process powershell -Verb runAs -ArgumentList $arguments
  # Break
}

if ($args[0] -eq '-h' -or $args.Length -eq 0) {
  Write-Output "set port forword, to use: port option value [host]"
  Write-Output "option:"
  Write-Output "  - add: add port forword"
  Write-Output "  - rm: remove port forword"
  Write-Output "  - ls: list forworded port"

  Write-Output "value: the listened port"
  Write-Output "host(option): connect port, default localhost"
  exit;
}

$isSet = $args[0]
$port = $args[1]
$cHost = $args[2]

if ($args.Length -eq 2) {
  $cHost = "localhost"
}

if ($isSet -eq 'add') {
  netsh interface portproxy add v4tov4 `
    listenport=$port listenaddress=0.0.0.0 `
    connectport=$port connectaddress=$cHost
  Write-Output "Port forwarding to $port"
}
elseif ($isSet -eq 'rm') {
  netsh interface portproxy delete v4tov4`
  listenport=$port listenaddress=0.0.0.0
  Write-Output "rm $port"
}
elseif ($isSet -eq 'ls') {
  netsh interface portproxy show all
}
