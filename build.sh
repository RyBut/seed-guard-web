#!/bin/bash
set -e
source ./venv/bin/activate

echo "🔧 Building frontend..."
rm -rf dist
cd frontend
npm install
npm run build
cd ..

echo "📁 Copying frontend build into backend/static..."
rm -rf backend/static
mkdir -p backend/static
cp -r frontend/dist/* backend/static/
cd backend

echo "📦 Bundling backend with PyInstaller..."
pip install pyinstaller

pyinstaller main.py \
  --onefile \
  --name seed-guard \
  --add-data "static:frontend/dist" \
  --icon ../Seed-Guard.icns \
  --windowed

cd ..
mkdir -p dist
cp -R backend/dist/seed-guard.app dist/
cp backend/dist/seed-guard dist/
rm -rf backend/dist

echo "✅ Build complete!"
echo "Run it using: ./dist/seed-guard"
