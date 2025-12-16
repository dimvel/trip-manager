#!/bin/bash

# Trip Manager - Automated Setup Script
# Run in WSL Ubuntu

set -e  # Exit on error

echo "🚀 Starting Trip Manager Setup..."
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}"
echo -e "${GREEN}✓ npm version: $(npm --version)${NC}"

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo -e "${YELLOW}⚠ Java not found. Installing OpenJDK 17...${NC}"
    sudo apt install -y openjdk-17-jdk
fi

echo -e "${GREEN}✓ Java version: $(java --version | head -n 1)${NC}"

# Create project
echo ""
echo "📦 Creating React project..."
if [ -d "trip-manager" ]; then
    echo -e "${YELLOW}⚠ trip-manager directory already exists${NC}"
    read -p "Do you want to remove it and start fresh? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf trip-manager
    else
        echo "Exiting..."
        exit 1
    fi
fi

npx create-react-app trip-manager
cd trip-manager

echo ""
echo "📚 Installing dependencies..."
npm install pouchdb pouchdb-find react-router-dom
npm install jspdf jspdf-autotable papaparse
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

echo ""
echo "⚙️ Initializing Capacitor..."
npx cap init "Trip Manager" "com.tripmanager.app" --web-dir=build

echo ""
echo "📱 Adding Android platform..."
npx cap add android

echo ""
echo "📁 Creating directory structure..."
mkdir -p src/components
mkdir -p src/services

echo ""
echo "✅ Setup complete!"
echo ""
echo "=================================="
echo "📋 NEXT STEPS:"
echo "=================================="
echo ""
echo "1. Copy the source files to the project:"
echo "   - src/components/*.js"
echo "   - src/services/database.js"
echo "   - src/App.js"
echo "   - src/index.css"
echo "   - capacitor.config.json"
echo ""
echo "2. Start development server:"
echo "   cd trip-manager"
echo "   npm start"
echo ""
echo "3. Build for Android:"
echo "   npm run build"
echo "   npx cap sync android"
echo "   npx cap open android"
echo ""
echo "=================================="
echo -e "${GREEN}🎉 Happy Coding!${NC}"
echo "=================================="