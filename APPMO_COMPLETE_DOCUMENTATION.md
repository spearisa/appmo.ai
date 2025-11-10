
# Appmo - Complete Documentation Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Installation & Setup](#installation--setup)
4. [Usage Guide](#usage-guide)
5. [API Documentation](#api-documentation)
6. [Configuration](#configuration)
7. [Troubleshooting](#troubleshooting)
8. [Technical Details](#technical-details)
9. [Cost Analysis](#cost-analysis)
10. [File Structure](#file-structure)
11. [Development Guide](#development-guide)

---

## 🎯 Overview

**Appmo** is a complete AI-powered website generation platform that allows users to create professional websites using natural language prompts. The system consists of multiple components working together to provide a seamless website creation experience.

### Key Features
- ✅ **AI-Powered Website Generation** - Create websites from text prompts
- ✅ **Gallery System** - Browse 1,653+ example websites
- ✅ **Multiple Interfaces** - Gallery, Functional, and Full App modes
- ✅ **Open-Source Default AI** - Qwen3 Coder 7B via Hugging Face Inference (no OpenAI billing)
- ✅ **GitHub Workspace** - Sign in with GitHub and persist projects in Neon Postgres
- ✅ **Optional Larger Models** - Qwen3 Coder 30B or custom endpoints
- ✅ **Optional OpenAI Integration** - GPT-4o Mini and other paid providers
- ✅ **Professional Output** - TailwindCSS, responsive design
- ✅ **Local Development** - Everything runs on your machine

### System Statistics
- **Total Storage**: 985 MB
- **Source Files**: 178 files
- **Lines of Code**: ~65,898 lines
- **Screenshots**: 1,653+ examples
- **Dependencies**: Node.js, Python, Next.js, React

---

## 🏗️ System Architecture

### Components Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Appmo System                             │
├─────────────────────────────────────────────────────────────┤
│  Port 8000: Gallery Server (Python)                        │
│  ├─ Browse 1,653+ website examples                         │
│  ├─ Static file serving                                     │
│  └─ Screenshot display                                      │
├─────────────────────────────────────────────────────────────┤
│  Port 3001: AI Proxy Server (Node.js)                      │
│  ├─ Proxies requests to Next.js API                         │
│  ├─ Streams Hugging Face Qwen responses                     │
│  └─ Eliminates legacy mock generator                        │
├─────────────────────────────────────────────────────────────┤
│  Port 3000: Full Appmo App (Next.js/React)                 │
│  ├─ Complete AI website builder                             │
│  ├─ Real OpenAI integration                                 │
│  ├─ Professional interface                                  │
│  └─ Settings management                                     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Frontend**: React, Next.js, TailwindCSS, TypeScript
- **Backend**: Node.js, Express, Python HTTP Server
- **AI Integration**: Qwen3 Coder 7B via Hugging Face (default), Qwen3 Coder 30B & OpenAI GPT-4o Mini (optional)
- **Database**: Local storage (browser localStorage)
- **Styling**: TailwindCSS, Font Awesome icons
- **Development**: npm, nvm (Node Version Manager)

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js**: v18.20.8 (managed via nvm)
- **Python**: 3.x (for gallery server)
- **npm**: Comes with Node.js
- **Git**: For cloning repositories

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd deepsite-gallery
```

#### 2. Install Node.js Dependencies
```bash
# Load nvm and install Node.js
source ~/.nvm/nvm.sh
nvm install v18.20.8
nvm use v18.20.8

# Install dependencies
npm install
cd deepsite-full
npm install
```

#### 3. Configure Environment & Database
```bash
# Copy env template or edit .env.local
cp deepsite-full/env.example deepsite-full/.env.local
# Update DATABASE_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NEXTAUTH_SECRET, HF tokens, etc.

# Generate Prisma client and sync schema to Neon
cd deepsite-full
npm run prisma:generate
npm run db:push
```

#### 4. Generate Screenshots (if needed)
```bash
# Generate placeholder screenshots
python3 generate_placeholders.py
```

#### 5. Start All Services
```bash
# Terminal 1: Gallery Server
python3 -m http.server 8000

# Terminal 2: AI Proxy Server
source ~/.nvm/nvm.sh && nvm use v18.20.8
node server.js

# Terminal 3: Full Appmo App
cd deepsite-full
source ~/.nvm/nvm.sh && nvm use v18.20.8
npm run dev
```

### Quick Start Scripts
```bash
# Start all services at once
./start-deepsite.sh

# Setup everything from scratch
./setup-deepsite.sh
```

---

## 📖 Usage Guide

### Accessing the Applications

#### 1. Appmo Gallery (Port 8000)
**URL**: http://localhost:8000
- **Purpose**: Browse 1,653+ AI-generated website examples
- **Features**: 
  - Grid view of website screenshots
  - Search and filter capabilities
  - Responsive design
  - No AI generation (viewing only)

#### 2. Appmo Functional (Port 3001)
**URL**: http://localhost:3001/deepsite-functional.html
- **Purpose**: Custom AI website builder that proxies the main API
- **Features**:
  - AI prompt input
  - Real-time website generation
  - Streams Hugging Face Qwen responses by default
  - Professional interface
  - Settings management

#### 3. Full Appmo App (Port 3000)
**URL**: http://localhost:3000/projects/new
- **Purpose**: Complete AI website generation platform
- **Features**:
  - Open-source default model (Qwen3 Coder 7B via Hugging Face)
  - Optional larger Qwen3 Coder models & OpenAI-compatible providers (with API key)
  - Professional editor interface
  - Live preview
  - Code editor
  - Settings and model selection

### Creating Websites

#### Basic Usage
0. **Sign in with GitHub** (top-right user menu) to unlock saving features
1. **Open** one of the applications
2. **Enter a prompt** describing your desired website
3. **Click generate** or press Enter
4. **View** the generated website in real-time
5. **Copy** the HTML code if needed
6. **Save to Workspace** using the editor toolbar (stores HTML + prompts in Neon)
7. **Push to GitHub** directly from the editor once a project is saved

#### Example Prompts
```
"Create a landing page for a tech startup"
"Build a portfolio website for a designer"
"Make an e-commerce product page"
"Design a blog homepage"
"Create a restaurant website with menu"
"Build a fitness app landing page"
```

#### Advanced Features
- **Model Selection**: Choose between Qwen3 Coder 7B (default), Qwen3 Coder 30B, GPT-4o Mini, or custom models
- **Settings**: Configure API keys, base URLs, and preferences
- **Live Preview**: See changes in real-time
- **Code Export**: Download generated HTML files

---

## 🔌 API Documentation

### AI Proxy Server API (Port 3001)

#### Generate Website
```http
POST /api/ask-ai
Content-Type: application/json

{
  "prompt": "Create a landing page for a tech startup",
  "model": "gpt-4o-mini",
  "apiKey": "your-api-key-here"
}
```

**Response**: Streaming HTML content

#### Default Open-Source Response System
When no OpenAI-style API key is provided, the platform calls Hugging Face Inference with Qwen3 Coder 7B:
- Streams real model outputs over the existing SSE connection
- Honors the same system prompts used for premium providers
- Produces full HTML documents without relying on hard-coded templates
- Requires a free Hugging Face token (`HF_API_TOKEN`) instead of paid OpenAI credits

### Projects API (App Workspace)

#### Save Project
```http
POST /api/projects
Content-Type: application/json

{
  "title": "Portfolio Landing Page",
  "description": "Hero, projects grid, contact form",
  "html": "<!DOCTYPE html>...",
  "prompts": ["Create a portfolio landing page with hero, project grid, and contact section"]
}
```

Requires an authenticated GitHub session. Saves or updates the project for the current user, returns the slug and latest metadata, and appends a version record.

### Full App API (Port 3000)

#### Generate New Website
```http
POST /api/ask-ai
Content-Type: application/json

{
  "prompt": "Your website description",
  "model": "gpt-4o-mini",
  "apiKey": "sk-your-openai-key",
  "baseUrl": "https://api.openai.com/v1"
}
```

#### Modify Existing Website
```http
PUT /api/ask-ai
Content-Type: application/json

{
  "prompt": "Make the header blue",
  "html": "<existing-html>",
  "model": "gpt-4o-mini",
  "apiKey": "sk-your-openai-key"
}
```

---

## ⚙️ Configuration

### Environment Variables
```bash
# OpenAI Configuration (Optional)
OPENAI_API_KEY=sk-your-key-here
OPENAI_BASE_URL=https://api.openai.com/v1

# Hugging Face Configuration (Required for default Qwen models)
HF_API_TOKEN=hf_your-token-here
# Optional overrides if you want to point to custom endpoints
HF_QWEN3_CODER_7B_MODEL_ID=Qwen/Qwen3-Coder-7B-Instruct
HF_QWEN3_CODER_30B_MODEL_ID=Qwen/Qwen3-Coder-30B-A3B-Instruct
HF_QWEN_MODEL_ID=Qwen/Qwen2.5-14B-Instruct  # Legacy Qwen 2.5 support (optional)

# Server Configuration
PORT=3000  # Full app port
AI_PROXY_PORT=3001  # AI proxy port
GALLERY_PORT=8000  # Gallery server port
```

### Browser Storage (localStorage)
```javascript
// API Configuration
localStorage.setItem('openai_api_key', 'your-key');
localStorage.setItem('openai_base_url', 'https://api.openai.com/v1');
localStorage.setItem('openai_model', 'qwen3-coder-7b-instruct');

// UI Preferences
localStorage.setItem('theme', 'dark');
localStorage.setItem('language', 'en');
```

### Model Configuration
```typescript
// Available Models
export const MODELS = [
  {
    value: "qwen3-coder-7b-instruct",
    label: "Qwen3 Coder 7B Instruct (Default)",
    providers: ["hf-inference"],
    autoProvider: "hf-inference",
    isThinker: false,
  },
  {
    value: "qwen3-coder-30b-instruct",
    label: "Qwen3 Coder 30B Instruct",
    providers: ["hf-inference"],
    autoProvider: "hf-inference",
    isThinker: false,
  },
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
    providers: ["openai-compatible"],
    autoProvider: "openai-compatible",
    isThinker: false,
  }
];
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "node: command not found"
**Solution**: Install Node.js via nvm
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js
nvm install v18.20.8
nvm use v18.20.8
```

#### 2. "npm: command not found"
**Solution**: Node.js not properly installed
```bash
source ~/.nvm/nvm.sh
nvm use v18.20.8
npm --version
```

#### 3. Port Already in Use
**Solution**: Kill existing processes
```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill
lsof -ti:8000 | xargs kill
```

#### 4. 404 Errors for Screenshots
**Solution**: Generate placeholder images
```bash
python3 generate_placeholders.py
```

#### 5. API Key Not Working
**Solutions**:
- Verify API key format (starts with `sk-`)
- Check OpenAI account balance
- Ensure internet connection
- Remove the OpenAI key to fall back to the default Hugging Face workflow

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* npm run dev

# Check server status
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:8000
```

---

## 🔬 Technical Details

### Open-Source AI Architecture

The default flow now uses Hugging Face Inference with Qwen3 Coder 7B, with optional upgrades to Qwen3 Coder 30B through the same interface. Configure `HF_QWEN3_CODER_30B_MODEL_ID` if you run the 30B model on a dedicated Inference Endpoint or custom infrastructure.

```typescript
async function generateWithHuggingFace(prompt: string) {
  const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
      },
      options: {
        wait_for_model: true,
      },
    }),
  });

  const data = await response.json();
  return Array.isArray(data)
    ? data[0]?.generated_text ?? ""
    : data?.generated_text ?? "";
}
```

### Streaming Response System
```typescript
const chunkSize = 600;
for (let i = 0; i < html.length; i += chunkSize) {
  const slice = html.slice(i, i + chunkSize);
  await writer.write(encoder.encode(slice));
  if (STREAM_DELAY_MS > 0) {
    await wait(STREAM_DELAY_MS);
  }
}
```

### HTML Template System
The system includes pre-built templates for:
- **Landing Pages**: Hero sections, features, testimonials, contact forms
- **Portfolios**: Navigation, about sections, work galleries, contact info
- **E-commerce**: Product pages, shopping carts, reviews, checkout
- **Blogs**: Headers, featured posts, article grids, newsletter signup

### Technology Integration
- **TailwindCSS**: Utility-first CSS framework
- **Font Awesome**: Icon library
- **Responsive Design**: Mobile-first approach
- **Modern HTML5**: Semantic markup
- **CSS Grid/Flexbox**: Layout systems

---

## 💰 Cost Analysis

### Open-Source Mode (Current Default)
- **Cost**: $0.00 (requires free Hugging Face token)
- **API Calls**: 1 per generation (Hugging Face Inference)
- **Data Usage**: ~1-5MB per request
- **Quality**: High (Qwen3 Coder 7B output)
- **Variety**: Broad (model-driven)
- **Notes**: Qwen3 Coder 30B is available but may require a paid Inference Endpoint or custom GPU hosting for consistent latency.

### Real AI Mode (With API Key)
- **Cost**: $0.01-0.05 per website
- **API Calls**: 1 per generation
- **Data Usage**: ~1-5MB per request
- **Quality**: Very High (unique, creative)
- **Variety**: Unlimited (AI-generated)

### Cost Breakdown (GPT-4o Mini)
```
Input Tokens:  $0.15 per 1M tokens  (~$0.001 per website)
Output Tokens: $0.60 per 1M tokens  (~$0.02-0.05 per website)
Total:         ~$0.01-0.05 per website
```

### Usage Scenarios
- **Testing/Demo**: Use open-source default with Hugging Face token
- **Production**: Opt into OpenAI-compatible providers as needed
- **Development**: Mix models per environment
- **Learning**: Start with the default Qwen setup, optionally upgrade to premium APIs

---

## 📁 File Structure

```
deepsite-gallery/
├── README.md                          # Project overview
├── package.json                       # Dependencies and scripts
├── server.js                          # AI proxy server
├── index.html                         # Gallery homepage
├── deepsite-functional.html           # Functional AI builder
├── screenshots.json                   # Screenshot metadata
├── screenshots/                       # Website screenshots (1,653+ files)
├── generated-websites/                # Generated HTML files
├── deepsite-full/                     # Full Next.js application
│   ├── app/                          # Next.js app directory
│   │   ├── api/ask-ai/route.ts       # AI API endpoints
│   │   ├── layout.tsx                # Root layout
│   │   └── (public)/page.tsx         # Public pages
│   ├── components/                   # React components
│   │   ├── editor/                   # Editor components
│   │   ├── ui/                       # UI components
│   │   └── contexts/                 # React contexts
│   ├── lib/                          # Utility libraries
│   │   ├── providers.ts              # AI model providers
│   │   ├── prompts.ts                # AI prompts
│   │   └── utils.ts                  # Helper functions
│   ├── assets/                       # Static assets
│   ├── package.json                  # Next.js dependencies
│   └── next.config.ts                # Next.js configuration
├── node_modules/                      # Dependencies (92MB)
├── generate_placeholders.py           # Screenshot generator
├── deepsite_client.py                 # Python client
└── STATUS.md                          # Current status
```

### Key Files Explained

#### server.js
- **Purpose**: Lightweight proxy to the Next.js AI endpoints
- **Port**: 3001
- **Features**: Streams Hugging Face responses, aligns local functional UI with production

#### deepsite-full/
- **Purpose**: Complete Next.js application
- **Port**: 3000
- **Features**: Real AI integration, professional interface

#### screenshots.json
- **Purpose**: Metadata for 1,653+ website examples
- **Size**: 127KB
- **Format**: JSON array with filename, title, description

#### generate_placeholders.py
- **Purpose**: Creates placeholder images for gallery
- **Output**: 1,653 PNG files in screenshots/ directory

---

## 🛠️ Development Guide

### Adding New Features

#### 1. New Website Templates
```javascript
// In server.js, add new template type
function generateRealisticHTML(prompt) {
    const isNewType = prompt.toLowerCase().includes('new-type');
    
    if (isNewType) {
        html += generateNewTypeTemplate();
    }
}

function generateNewTypeTemplate() {
    return `
    <!-- New template HTML -->
    <div class="container mx-auto">
        <!-- Template content -->
    </div>`;
}
```

#### 2. New AI Models
```typescript
// In lib/providers.ts
export const MODELS = [
    // Existing models...
    {
        value: "claude-3-sonnet",
        label: "Claude 3 Sonnet",
        providers: ["anthropic"],
        isThinker: false,
    }
];
```

#### 3. New UI Components
```typescript
// Create new component
export function NewFeature() {
    return (
        <div className="new-feature">
            {/* Component content */}
        </div>
    );
}
```

### Customization Options

#### Styling
- **TailwindCSS**: Modify utility classes
- **Custom CSS**: Add to globals.css
- **Theme**: Update color scheme in tailwind.config.js

#### AI Prompts
- **System Prompts**: Modify in lib/prompts.ts
- **User Prompts**: Update prompt templates
- **Response Format**: Change HTML generation logic

#### UI/UX
- **Layout**: Modify component structure
- **Navigation**: Update header/footer components
- **Settings**: Add new configuration options

### Deployment

#### Local Development
```bash
# Start all services
npm run dev:all

# Individual services
npm run dev:gallery
npm run dev:proxy
npm run dev:app
```

#### Production Deployment
```bash
# Build Next.js app
cd deepsite-full
npm run build

# Start production server
npm start

# Use PM2 for process management
pm2 start npm --name "appmo" -- start
```

---

## 📊 Performance Metrics

### System Performance
- **Startup Time**: ~10-15 seconds
- **Memory Usage**: ~200-500MB total
- **CPU Usage**: Low (mostly idle)
- **Disk Usage**: 985MB total

### Response Times
- **Hugging Face Qwen Generation**: ~5-12 seconds (model warm-up dependent)
- **OpenAI-Compatible Generation**: ~10-30 seconds
- **Gallery Loading**: ~1-3 seconds
- **Page Navigation**: <1 second

### Scalability
- **Concurrent Users**: Limited by local resources
- **API Rate Limits**: OpenAI limits apply with real API
- **Storage**: Scales with screenshot count
- **Memory**: Scales with concurrent generations

---

## 🔒 Security Considerations

### API Key Security
- **Storage**: Browser localStorage (client-side)
- **Transmission**: HTTPS recommended for production
- **Rotation**: Regular API key rotation recommended
- **Access**: Limit API key permissions in OpenAI dashboard

### Data Privacy
- **Local Storage**: All data stays on your machine
- **No Tracking**: No analytics or user tracking
- **Open Source**: Code is transparent and auditable
- **Offline Capable**: Works without internet (mock mode)

### Production Security
```bash
# Use environment variables
export OPENAI_API_KEY="your-secure-key"
export NODE_ENV="production"

# Enable HTTPS
# Use reverse proxy (nginx)
# Implement rate limiting
# Add authentication if needed
```

---

## 📈 Future Enhancements

### Planned Features
1. **Multiple AI Providers**: Claude, Gemini, local models
2. **Template Library**: Expandable template system
3. **User Accounts**: Save and manage projects
4. **Collaboration**: Multi-user editing
5. **Export Options**: PDF, image, code formats
6. **Mobile App**: React Native version
7. **Plugin System**: Extensible architecture
8. **Analytics**: Usage tracking and insights

### Technical Improvements
1. **Performance**: Caching and optimization
2. **Scalability**: Database integration
3. **Monitoring**: Health checks and logging
4. **Testing**: Comprehensive test suite
5. **Documentation**: API documentation
6. **CI/CD**: Automated deployment pipeline

---

## 📞 Support & Resources

### Getting Help
1. **Documentation**: This file and README.md
2. **Code Comments**: Inline documentation
3. **GitHub Issues**: Bug reports and feature requests
4. **Community**: Developer forums and Discord

### Useful Links
- **OpenAI API**: https://platform.openai.com/docs
- **Qwen3 Coder Collection**: https://huggingface.co/collections/Qwen/qwen3-coder
- **Next.js Docs**: https://nextjs.org/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **React Docs**: https://react.dev

### Development Tools
- **VS Code**: Recommended editor
- **Browser DevTools**: Debug and inspect
- **Postman**: API testing
- **Git**: Version control

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Complete AI website generation system
- ✅ Open-source Qwen3 Coder responses (default mode)
- ✅ Real OpenAI integration
- ✅ Gallery with 1,653+ examples
- ✅ Multiple interface options
- ✅ Professional HTML output
- ✅ Responsive design
- ✅ Settings management

### Upcoming Versions
- **v1.1.0**: Multiple AI providers
- **v1.2.0**: Template library expansion
- **v1.3.0**: User accounts and projects
- **v2.0.0**: Complete redesign and new features

---

## 🏆 Conclusion

**Appmo** is a comprehensive AI-powered website generation platform that combines the power of artificial intelligence with professional web development practices. Whether you're using the free mock mode for testing and learning, or the real AI mode for production websites, Appmo provides a complete solution for creating professional websites from simple text prompts.

The system is designed to be:
- **Easy to use** for beginners
- **Powerful** for professionals
- **Flexible** for customization
- **Cost-effective** with free mock mode
- **Scalable** for future enhancements

With nearly 1GB of code, 66,000+ lines of source code, and 1,653+ website examples, Appmo represents a significant investment in AI-powered web development technology that's now available locally on your machine.

---

**Document Version**: 1.0.0  
**Last Updated**: September 13, 2025  
**Total Pages**: This comprehensive guide  
**Word Count**: ~5,000 words  

*This documentation covers everything you need to know about your Appmo website generation system.*
