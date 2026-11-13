$ErrorActionPreference = "Stop"

$InstallDir = Join-Path $env:LOCALAPPDATA "Programs\Nexus Core"
$StartMenuLink = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\NEXUS CORE.lnk"
$DesktopLink = Join-Path ([Environment]::GetFolderPath("Desktop")) "NEXUS CORE.lnk"

Remove-Item -LiteralPath $StartMenuLink -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $DesktopLink -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $InstallDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "NEXUS CORE application files were removed." -ForegroundColor Green
Write-Host "User tools, notes, projects and history were kept in LocalAppData." -ForegroundColor Cyan
