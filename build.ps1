# Exit on error
$ErrorActionPreference = "Stop"

Write-Host "[*] Building frontend..."
Push-Location frontend
npm install
npm run build
Pop-Location

Write-Host "[*] Activating virtual environment and installing PyInstaller..."
. .\venv\Scripts\Activate.ps1
pip install pyinstaller

Write-Host "[*] Copying frontend build into backend/static..."
Remove-Item -Recurse -Force backend/static -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path backend/static
Copy-Item -Recurse -Force frontend/dist/* backend/static/

Write-Host "[*] Bundling backend with PyInstaller..."
Push-Location backend

# Add virtualenv Scripts to PATH
$env:PATH = "$PWD\..\venv\Scripts;$env:PATH"

# Bundle the app
pyinstaller main.py --onefile --name seed-guard --icon "../seed-guard.ico" --add-data "static;frontend/dist" --windowed

Pop-Location

Write-Host "[*] Preparing output..."
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path dist
Copy-Item backend\dist\seed-guard.exe dist\
Remove-Item -Recurse -Force backend\dist -ErrorAction SilentlyContinue

Write-Host "[DONE] Build complete!"