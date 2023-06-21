$startup = "C:\Users\Organic_Fish\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup"

if ($args[0]) {
	subl $startup\startup.ps1
} else {
	explorer $startup
}

