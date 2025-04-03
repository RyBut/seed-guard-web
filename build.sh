#!/bin/bash
set -e

echo "🔧 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "📁 Copying frontend build into backend/static..."
rm -rf backend/static
mkdir -p backend/static
cp -r frontend/dist/* backend/static/

echo "📦 Bundling backend with PyInstaller..."
pip install pyinstaller

pyinstaller backend/main.py \
  --onefile \
  --name seed-guard \
  --add-data "backend/static:frontend/dist" \
  --icon Seed-Guard.icns \
  --windowed

echo "✅ Build complete!"
echo "Run it using: ./dist/seed-guard"
