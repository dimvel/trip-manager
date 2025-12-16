#!/bin/bash

# Trip Manager - Build and Deploy Script
# Run in WSL Ubuntu

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════╗"
echo "║   Trip Manager Build & Deploy     ║"
echo "╚════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo -e "${YELLOW}🔍 Checking dependencies...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
echo -e "${GREEN}✓ npm: $(npm --version)${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf build
rm -rf android/app/build

# Build React app
echo -e "${YELLOW}🔨 Building React application...${NC}"
npm run build

if [ ! -d "build" ]; then
    echo -e "${RED}❌ Build failed - build directory not created${NC}"
    exit 1
fi

echo -e "${GREEN}✓ React build successful${NC}"

# Sync with Capacitor
echo -e "${YELLOW}📱 Syncing with Capacitor...${NC}"
npx cap sync android

echo -e "${GREEN}✓ Capacitor sync successful${NC}"

# Copy to Android
echo -e "${YELLOW}📋 Copying assets to Android...${NC}"
npx cap copy android

# Generate build info
BUILD_DATE=$(date '+%Y-%m-%d %H:%M:%S')
BUILD_VERSION=$(node -p "require('./package.json').version")

cat > build/build-info.txt << EOF
Trip Manager Build Information
==============================
Build Date: $BUILD_DATE
Version: $BUILD_VERSION
Node: $(node --version)
npm: $(npm --version)
==============================
EOF

echo ""
echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open Android Studio:"
echo -e "   ${YELLOW}npx cap open android${NC}"
echo ""
echo "2. In Android Studio:"
echo "   - Wait for Gradle sync to complete"
echo "   - Build → Select Build Variant → release"
echo "   - Build → Generate Signed Bundle/APK"
echo "   - Choose APK → Next"
echo "   - Select/Create keystore"
echo "   - Build → Wait for completion"
echo ""
echo "3. Find APK at:"
echo -e "   ${GREEN}android/app/release/app-release.apk${NC}"
echo ""
echo "4. Deploy to tablet:"
echo -e "   ${YELLOW}adb install android/app/release/app-release.apk${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask if user wants to open Android Studio
read -p "Open Android Studio now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🚀 Opening Android Studio...${NC}"
    npx cap open android
fi

echo ""
echo -e "${GREEN}🎉 Done!${NC}"