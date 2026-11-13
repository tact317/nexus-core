$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

Write-Host "NEXUS CORE v1.20.0 - Native Windows EXE Builder" -ForegroundColor Magenta

if (Get-Command py -ErrorAction SilentlyContinue) {
    $Python = "py"
    $PythonArgs = @("-3")
}
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $Python = "python"
    $PythonArgs = @()
}
else {
    Write-Host "Python was not found." -ForegroundColor Red
    exit 1
}

function Test-PythonModule([string]$ModuleName) {
    $Previous = $ErrorActionPreference
    $ErrorActionPreference = "SilentlyContinue"
    & $Python @PythonArgs -c "import importlib.util,sys; sys.exit(0 if importlib.util.find_spec('$ModuleName') else 1)" 2>$null
    $Available = ($LASTEXITCODE -eq 0)
    $ErrorActionPreference = $Previous
    return $Available
}

$RequiredPackages = @()
if (-not (Test-PythonModule "PyInstaller")) { $RequiredPackages += "pyinstaller" }
if (-not (Test-PythonModule "webview")) { $RequiredPackages += "pywebview" }

if ($RequiredPackages.Count -gt 0) {
    Write-Host "Installing native desktop build dependencies: $($RequiredPackages -join ', ')" -ForegroundColor Cyan
    & $Python @PythonArgs -m pip install --disable-pip-version-check @RequiredPackages
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Dependency installation failed." -ForegroundColor Red
        Write-Host "Run: py -3 -m pip install pyinstaller pywebview" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Building NexusCoreHub.exe with the custom NEXUS icon..." -ForegroundColor Cyan
& $Python @PythonArgs -m PyInstaller `
    --noconfirm `
    --clean `
    --onefile `
    --windowed `
    --name "NexusCoreHub" `
    --icon "assets\icons\nexus.ico" `
    --collect-all "webview" `
    --hidden-import "webview.platforms.edgechromium" `
    --hidden-import "webview.platforms.winforms" `
    --add-data "index.html;." `
    --add-data "app.js;." `
    --add-data "styles.css;." `
    --add-data "assets;assets" `
    --add-data "data;data" `
    server.py

if ($LASTEXITCODE -ne 0) {
    Write-Host "EXE build failed." -ForegroundColor Red
    exit 1
}

Write-Host "Build complete: dist\NexusCoreHub.exe" -ForegroundColor Green
Write-Host "Run install_desktop.ps1 to replace the installed application and shortcuts." -ForegroundColor Cyan
