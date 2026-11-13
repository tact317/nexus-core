$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$Version = "1.20.0"
$SourceExe = Join-Path $PSScriptRoot "dist\NexusCoreHub.exe"
$SourceVersion = Join-Path $PSScriptRoot "VERSION.txt"
if (-not (Test-Path -LiteralPath $SourceExe)) {
    Write-Host "dist\NexusCoreHub.exe was not found. Run build_exe.ps1 first." -ForegroundColor Red
    exit 1
}

$InstallDir = Join-Path $env:LOCALAPPDATA "Programs\Nexus Core"
$InstallExe = Join-Path $InstallDir "NexusCoreHub.exe"
$PreviousExe = Join-Path $InstallDir "NexusCoreHub.previous.exe"
$InstallVersion = Join-Path $InstallDir "VERSION.txt"
$UserRoot = Join-Path $env:LOCALAPPDATA "NexusCoreStreetResearchHub"
$DataDir = Join-Path $UserRoot "data"
$AssetDir = Join-Path $UserRoot "assets"
$BackupDir = Join-Path $UserRoot "backups"
$StartMenuDir = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"
$StartMenuLink = Join-Path $StartMenuDir "NEXUS CORE.lnk"
$DesktopLink = Join-Path ([Environment]::GetFolderPath("Desktop")) "NEXUS CORE.lnk"

Get-Process NexusCoreHub -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

if (Test-Path -LiteralPath $InstallExe) {
    Copy-Item -LiteralPath $InstallExe -Destination $PreviousExe -Force
}

# Back up both registry data and custom user assets before replacement.
if ((Test-Path -LiteralPath $DataDir) -or (Test-Path -LiteralPath $AssetDir)) {
    $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $BackupZip = Join-Path $BackupDir "pre_update_v1_20_$Timestamp.zip"
    $Stage = Join-Path $env:TEMP "NexusCoreUpdateBackup_$Timestamp"
    try {
        New-Item -ItemType Directory -Force -Path $Stage | Out-Null
        if (Test-Path -LiteralPath $DataDir) {
            Copy-Item -LiteralPath $DataDir -Destination (Join-Path $Stage "data") -Recurse -Force
        }
        if (Test-Path -LiteralPath $AssetDir) {
            Copy-Item -LiteralPath $AssetDir -Destination (Join-Path $Stage "assets") -Recurse -Force
        }
        Compress-Archive -Path (Join-Path $Stage "*") -DestinationPath $BackupZip -CompressionLevel Optimal -Force
        Write-Host "Data and asset backup: $BackupZip" -ForegroundColor DarkCyan
    }
    catch {
        Write-Host "Pre-update backup could not be created: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    finally {
        Remove-Item -LiteralPath $Stage -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Copy-Item -LiteralPath $SourceExe -Destination $InstallExe -Force
Copy-Item -LiteralPath $SourceVersion -Destination $InstallVersion -Force

$Shell = New-Object -ComObject WScript.Shell
foreach ($LinkPath in @($StartMenuLink, $DesktopLink)) {
    Remove-Item -LiteralPath $LinkPath -Force -ErrorAction SilentlyContinue
    $Shortcut = $Shell.CreateShortcut($LinkPath)
    $Shortcut.TargetPath = $InstallExe
    $Shortcut.WorkingDirectory = $InstallDir
    $Shortcut.IconLocation = "$InstallExe,0"
    $Shortcut.Description = "NEXUS CORE Street Research Hub v$Version"
    $Shortcut.Save()
}

if (Test-Path "$env:WINDIR\System32\ie4uinit.exe") {
    Start-Process "$env:WINDIR\System32\ie4uinit.exe" -ArgumentList "-show" -WindowStyle Hidden -Wait
}

Write-Host "Installed: $InstallExe" -ForegroundColor Green
Write-Host "Version: $Version" -ForegroundColor Cyan
Write-Host "Desktop and Start Menu shortcuts were refreshed." -ForegroundColor Cyan
if (Test-Path -LiteralPath $PreviousExe) {
    Write-Host "Rollback copy: $PreviousExe" -ForegroundColor DarkCyan
}
Write-Host "Tool registrations and user content remain in LocalAppData." -ForegroundColor Cyan
Write-Host "Run verify_install.ps1 to validate the installed application." -ForegroundColor Cyan
