$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

Write-Host "NEXUS CORE - Street Research Hub v1.20.0" -ForegroundColor Magenta
Write-Host "Starting native desktop shell at http://127.0.0.1:4173" -ForegroundColor Cyan

if (Get-Command py -ErrorAction SilentlyContinue) {
    $Python = "py"; $PythonArgs = @("-3")
}
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $Python = "python"; $PythonArgs = @()
}
elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $Python = "python3"; $PythonArgs = @()
}
else {
    Write-Host "Python was not found. Install Python 3 and try again." -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit 1
}

$Previous = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
& $Python @PythonArgs -c "import importlib.util,sys; sys.exit(0 if importlib.util.find_spec('webview') else 1)" 2>$null
$HasWebView = ($LASTEXITCODE -eq 0)
$ErrorActionPreference = $Previous
if (-not $HasWebView) {
    Write-Host "Installing pywebview for a native taskbar icon and application window..." -ForegroundColor Cyan
    & $Python @PythonArgs -m pip install --disable-pip-version-check pywebview
    if ($LASTEXITCODE -ne 0) {
        Write-Host "pywebview installation failed. Edge app-mode fallback will be used." -ForegroundColor Yellow
    }
}

& $Python @PythonArgs server.py --desktop
