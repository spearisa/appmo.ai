#!/bin/bash

# DeepSite Full Setup Script
echo "🚀 Setting up DeepSite Full Application..."

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Navigate to deepsite-full directory
cd deepsite-full

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing..."
    nvm install 18
    nvm use 18
fi

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "⚙️ Creating environment configuration..."
    cat > .env.local << EOF
# DeepSite Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-api-key-here
MONGODB_URI=mongodb://localhost:27017/deepsite
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://neondb_owner:your-password@your-neon-host/neondb?sslmode=require
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
HF_API_TOKEN=your-huggingface-token-here
HF_QWEN_MODEL_ID=Qwen/Qwen2.5-14B-Instruct
HF_API_URL=https://api-inference.huggingface.co/models/Qwen/Qwen2.5-14B-Instruct
HF_QWEN3_CODER_7B_MODEL_ID=Qwen/Qwen3-Coder-7B-Instruct
HF_QWEN3_CODER_30B_MODEL_ID=https://api-inference.huggingface.co/models/Qwen/Qwen3-Coder-30B-A3B-Instruct
EOF
    echo "✅ Environment file created at .env.local"
    echo "⚠️  Please update the API keys in .env.local"
fi

echo "🎉 DeepSite setup complete!"
echo ""
echo "📋 Available commands:"
echo "  ./start-deepsite.sh    - Start the development server"
echo "  ./build-deepsite.sh    - Build for production"
echo "  ./stop-deepsite.sh     - Stop the server"
echo ""
echo "🌐 Once started, access DeepSite at: http://localhost:3000"
