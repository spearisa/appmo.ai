#!/bin/bash

# Start DeepSite Full Application
echo "🚀 Starting DeepSite Full Application..."

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Navigate to deepsite-full directory
cd deepsite-full

# Use Node.js 18
nvm use 18

# Start the development server
echo "🌐 Starting DeepSite on http://localhost:3000"
echo "📝 Press Ctrl+C to stop the server"
echo ""

npm run dev
