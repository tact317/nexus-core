$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
Write-Host "NEXUS CORE - Browser fallback v1.20.0" -ForegroundColor Magenta
if (Get-Command py -ErrorAction SilentlyContinue) { & py -3 server.py --browser }
elseif (Get-Command python -ErrorAction SilentlyContinue) { & python server.py --browser }
elseif (Get-Command python3 -ErrorAction SilentlyContinue) { & python3 server.py --browser }
else { Write-Host "Python was not found." -ForegroundColor Red; Read-Host "Press Enter to close"; exit 1 }
