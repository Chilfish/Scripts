# 指定目录的路径
$sourcePath = "D:/videos/bili"
# 指定目标目录的路径
$destinationPath = "D:/videos/bili/"

# 获取指定目录下的文件夹
$folders = Get-ChildItem -Path $sourcePath -Directory

# 遍历每个文件夹
foreach ($folder in $folders) {
    # 获取文件夹中的文件
    $files = Get-ChildItem -Path $folder.FullName -File

    # # 移动文件到指定目录中
    foreach ($file in $files) {
        Move-Item -Path $file.FullName -Destination $destinationPath
    }
}

# 删除空文件夹
Get-ChildItem -Path $sourcePath -Recurse `
| Where-Object { $_.PSIsContainer -and @(Get-ChildItem -LiteralPath $_.FullName).Count -eq 0 } `
| Remove-Item -Recurse
