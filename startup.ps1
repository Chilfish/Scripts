$mem = "D:\APP\Tools\Mem Reduct\memreduct.exe"
$sync = "D:\Scoop\apps\syncthing\current\syncthing.exe"
$aria2 = "D:\Scoop\apps\aria2\current\aria2.exe"

Start-Process $sync  -WindowStyle Hidden
Start-Process $mem   -WindowStyle Hidden
# Start-Process $aria2 -WindowStyle Hidden
