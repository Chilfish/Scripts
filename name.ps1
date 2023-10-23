# 获取所有以svg为后缀的文件
$files = Get-ChildItem -Path "D:\Chilling\Mini\hzc-mini\src\static\svg" -Filter "*.svg"

function Translate-FileName {
    param(
        [string]$FileName
    )

    $translations = @{
        "成员管理" = "member-management"
        "点赞" = "like"
        "人才库" = "talent-pool"
        "收藏" = "favorite"
        "首图" = "main-image"
        "我的简历" = "my-resume"
        "我的收藏" = "my-favorites"
        "我的团队" = "my-team"
        "我的项目" = "my-project"
        "系统信息" = "system-info"
        "项目库" = "project-library"
        "项目信息" = "project-info"
        "消息空空" = "empty-message"
        "校企库" = "school-enterprise-library"
    }

    $translatedName = $FileName.ToLower() -replace ' ', '-'

    foreach ($translation in $translations.GetEnumerator()) {
        $translatedName = $translatedName -replace $translation.Key.ToLower(), $translation.Value
    }

    return $translatedName
}

foreach ($file in $files) {
    $newFileName = Translate-FileName -FileName $file.BaseName
    $newFileNameWithExtension = $newFileName + $file.Extension
    $newFilePath = Join-Path -Path $file.DirectoryName -ChildPath $newFileNameWithExtension
    Rename-Item -Path $file.FullName -NewName $newFilePath
}