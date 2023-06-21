# from: https://letmefly.blog.csdn.net/article/details/126082324

# 由 GPT 将原文的 CMD 转成 powershell

$prefix = "$env:userprofile\AppData\Roaming\Code\"

$dirsToDelete = @(
    "CachedExtensionVSIXs\",
    "Cache\",
    "CachedData\",
    "CachedExtensions\",
    "CachedExtensionVSIXs\",
    "Code Cache\",
    "Crashpad\",
    "logs\",
    "Service Worker\CacheStorage\",
    "Service Worker\ScriptCache\",
    "User\workspaceStorage\",
    "User\History\"
)

foreach($dir in $dirsToDelete) {
    $fullPath = $prefix + $dir
    Remove-Item -Path $fullPath -Recurse -Force
    New-Item -ItemType Directory -Path $fullPath
}
