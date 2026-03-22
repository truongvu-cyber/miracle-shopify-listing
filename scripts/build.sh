#!/bin/bash
# Build script for Miracle Shopify Listing
# Usage: ./scripts/build.sh [platform]
# Platforms: macos, macos-intel, all (default: current platform)

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "🔨 Miracle Shopify Listing - Production Build"
echo "============================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf src-tauri/target/release/bundle 2>/dev/null || true

# Install deps if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm ci
fi

PLATFORM="${1:-auto}"

case "$PLATFORM" in
  macos|auto)
    echo "🍎 Building for macOS (Apple Silicon)..."
    npx tauri build --target aarch64-apple-darwin
    ;;
  macos-intel)
    echo "🍎 Building for macOS (Intel)..."
    npx tauri build --target x86_64-apple-darwin
    ;;
  macos-universal)
    echo "🍎 Building for macOS (Universal - ARM + Intel)..."
    npx tauri build --target aarch64-apple-darwin
    npx tauri build --target x86_64-apple-darwin
    ;;
  *)
    echo "❌ Unknown platform: $PLATFORM"
    echo "   Available: macos, macos-intel, macos-universal"
    exit 1
    ;;
esac

echo ""
echo "✅ Build complete!"
echo ""
echo "📁 Output files:"
find src-tauri/target/release/bundle -name "*.app" -o -name "*.dmg" -o -name "*.exe" -o -name "*.msi" -o -name "*.deb" -o -name "*.AppImage" 2>/dev/null | while read f; do
  size=$(du -sh "$f" | cut -f1)
  echo "   $size  $f"
done
