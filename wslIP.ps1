if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
  $arguments = "& '" +$myinvocation.mycommand.definition + "'"
  Start-Process powershell -Verb runAs -ArgumentList $arguments -WindowStyle Hidden
  Break
}

wsl -u root /etc/init.wsl start

wsl -d Ubuntu-22.04 -u root ip addr add 192.168.1.1/24 broadcast 192.168.1.255 dev eth0 label eth0:1

netsh interface ip add address "vEthernet (WSL)" 192.168.1.2 255.255.255.0
