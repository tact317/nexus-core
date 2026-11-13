$ErrorActionPreference = "Stop"
$InstallDir = Join-Path $env:LOCALAPPDATA "Programs\Nexus Core"
$InstallExe = Join-Path $InstallDir "NexusCoreHub.exe"
$PreviousExe = Join-Path $InstallDir "NexusCoreHub.previous.exe"

if (-not (Test-Path -LiteralPath $PreviousExe)) {
    Write-Host "No previous installed EXE was found." -ForegroundColor Red
    exit 1
}

Get-Process NexusCoreHub -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 350
Copy-Item -LiteralPath $PreviousExe -Destination $InstallExe -Force
Write-Host "Rolled back: $InstallExe" -ForegroundColor Green
Write-Host "User data was not changed." -ForegroundColor Cyan
