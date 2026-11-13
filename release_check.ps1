$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$ExpectedVersion = "1.20.0"
Write-Host "NEXUS CORE v$ExpectedVersion - Release Check" -ForegroundColor Magenta
$Failures = 0
$Warnings = 0

function Pass([string]$Message) { Write-Host "[PASS] $Message" -ForegroundColor Green }
function Fail([string]$Message) { Write-Host "[FAIL] $Message" -ForegroundColor Red; $script:Failures++ }
function Warn([string]$Message) { Write-Host "[WARN] $Message" -ForegroundColor Yellow; $script:Warnings++ }

function Check-File([string]$Path, [int64]$MinimumBytes = 1) {
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        Fail $Path
        return
    }
    $Length = (Get-Item -LiteralPath $Path).Length
    if ($Length -lt $MinimumBytes) {
        Fail "$Path is too small ($Length bytes)"
        return
    }
    Pass "$Path ($Length bytes)"
}

$Required = @(
    @{Path="index.html"; Min=1000},
    @{Path="app.js"; Min=10000},
    @{Path="styles.css"; Min=10000},
    @{Path="server.py"; Min=10000},
    @{Path="VERSION.txt"; Min=5},
    @{Path="run_all.ps1"; Min=100},
    @{Path="build_exe.ps1"; Min=500},
    @{Path="install_desktop.ps1"; Min=500},
    @{Path="rollback_desktop.ps1"; Min=100},
    @{Path="verify_install.ps1"; Min=100},
    @{Path="assets\icons\nexus.ico"; Min=1000},
    @{Path="assets\video\nexus_cinematic_wall_opening_v3.mp4"; Min=1000000},
    @{Path="assets\video\nexus_cinematic_wall_start_v3.jpg"; Min=1000},
    @{Path="assets\video\nexus_cinematic_wall_end_v3.jpg"; Min=1000},
    @{Path="docs\RELEASE_NOTES_v1_20.md"; Min=100},
    @{Path="docs\FINAL_ACCEPTANCE_CHECKLIST_v1_20.md"; Min=100}
)
foreach ($Item in $Required) { Check-File $Item.Path $Item.Min }

try {
    $Version = (Get-Content -LiteralPath "VERSION.txt" -Raw).Trim()
    if ($Version -eq $ExpectedVersion) { Pass "VERSION.txt = $ExpectedVersion" }
    else { Fail "VERSION.txt is $Version; expected $ExpectedVersion" }
}
catch { Fail "VERSION.txt could not be read" }

$VersionFiles = @("server.py", "app.js", "index.html", "run_all.ps1", "build_exe.ps1")
foreach ($Path in $VersionFiles) {
    $Text = Get-Content -LiteralPath $Path -Raw
    if ($Text.Contains($ExpectedVersion)) { Pass "$Path contains $ExpectedVersion" }
    else { Fail "$Path does not contain $ExpectedVersion" }
}

foreach ($JsonPath in @("data\tools.json", "data\projects.json", "data\notes.json", "data\launch_history.json")) {
    try {
        $null = Get-Content -LiteralPath $JsonPath -Raw | ConvertFrom-Json
        Pass "$JsonPath JSON"
    }
    catch { Fail "$JsonPath JSON: $($_.Exception.Message)" }
}

if (Get-Command py -ErrorAction SilentlyContinue) {
    & py -3 -m py_compile server.py
    if ($LASTEXITCODE -eq 0) { Pass "Python syntax" } else { Fail "Python syntax" }
}
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    & python -m py_compile server.py
    if ($LASTEXITCODE -eq 0) { Pass "Python syntax" } else { Fail "Python syntax" }
}
else { Warn "Python was not found; Python syntax check skipped" }

if (Get-Command node -ErrorAction SilentlyContinue) {
    & node --check app.js
    if ($LASTEXITCODE -eq 0) { Pass "JavaScript syntax" } else { Fail "JavaScript syntax" }
}
else { Warn "Node.js was not found; JavaScript syntax check skipped" }

try {
    $Bytes = [System.IO.File]::ReadAllBytes((Resolve-Path "assets\video\nexus_cinematic_wall_opening_v3.mp4"))
    if ($Bytes.Length -gt 12 -and [System.Text.Encoding]::ASCII.GetString($Bytes, 4, 4) -eq "ftyp") {
        Pass "MP4 signature"
    }
    else { Fail "MP4 signature" }
}
catch { Fail "MP4 signature check: $($_.Exception.Message)" }

$UserRoot = Join-Path $env:LOCALAPPDATA "NexusCoreStreetResearchHub"
$DataDir = Join-Path $UserRoot "data"
if (Test-Path -LiteralPath $DataDir) { Pass "User data directory: $DataDir" }
else { Write-Host "[INFO] User data directory will be created on first start." -ForegroundColor Cyan }

Write-Host ""
if ($Failures -gt 0) {
    Write-Host "Release check failed: $Failures failure(s), $Warnings warning(s)." -ForegroundColor Red
    exit 1
}
Write-Host "Release check completed: 0 failures, $Warnings warning(s)." -ForegroundColor Green
