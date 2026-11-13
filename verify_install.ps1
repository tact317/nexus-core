$ErrorActionPreference = "Stop"
$ExpectedVersion = "1.20.0"
$Failures = 0

function Pass([string]$Message) { Write-Host "[PASS] $Message" -ForegroundColor Green }
function Fail([string]$Message) { Write-Host "[FAIL] $Message" -ForegroundColor Red; $script:Failures++ }

Write-Host "NEXUS CORE v$ExpectedVersion - Installed Application Verification" -ForegroundColor Magenta

$InstallDir = Join-Path $env:LOCALAPPDATA "Programs\Nexus Core"
$InstallExe = Join-Path $InstallDir "NexusCoreHub.exe"
$InstalledVersion = Join-Path $InstallDir "VERSION.txt"
$DesktopLink = Join-Path ([Environment]::GetFolderPath("Desktop")) "NEXUS CORE.lnk"
$StartMenuLink = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\NEXUS CORE.lnk"
$UserRoot = Join-Path $env:LOCALAPPDATA "NexusCoreStreetResearchHub"
$DataDir = Join-Path $UserRoot "data"

if (Test-Path -LiteralPath $InstallExe) { Pass "Installed EXE: $InstallExe" } else { Fail "Installed EXE missing" }
if (Test-Path -LiteralPath $InstalledVersion) {
    $Version = (Get-Content -LiteralPath $InstalledVersion -Raw).Trim()
    if ($Version -eq $ExpectedVersion) { Pass "Installed version = $ExpectedVersion" }
    else { Fail "Installed version is $Version; expected $ExpectedVersion" }
}
else { Fail "Installed VERSION.txt missing" }

$Shell = New-Object -ComObject WScript.Shell
foreach ($LinkPath in @($DesktopLink, $StartMenuLink)) {
    if (-not (Test-Path -LiteralPath $LinkPath)) { Fail "Shortcut missing: $LinkPath"; continue }
    $Shortcut = $Shell.CreateShortcut($LinkPath)
    if ($Shortcut.TargetPath -eq $InstallExe) { Pass "Shortcut target: $LinkPath" }
    else { Fail "Shortcut target mismatch: $LinkPath -> $($Shortcut.TargetPath)" }
}

if (Test-Path -LiteralPath $DataDir) {
    Pass "User data directory: $DataDir"
    foreach ($Name in @("tools.json", "projects.json", "notes.json", "launch_history.json")) {
        $Path = Join-Path $DataDir $Name
        if (-not (Test-Path -LiteralPath $Path)) { Fail "User data missing: $Name"; continue }
        try { $null = Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json; Pass "User data JSON: $Name" }
        catch { Fail "Invalid user data JSON: $Name" }
    }
}
else { Fail "User data directory missing" }

if ($Failures -gt 0) {
    Write-Host "Installed application verification failed: $Failures issue(s)." -ForegroundColor Red
    exit 1
}
Write-Host "Installed application verification completed successfully." -ForegroundColor Green
