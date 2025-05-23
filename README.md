# 🧠 Neural Terminal v2.0

> Advanced AI-powered voice terminal with beautiful cyberpunk interface

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fduharts%2Fneural-terminal-v2)

![Neural Terminal Screenshot](https://via.placeholder.com/800x400/000000/00ff41?text=NEURAL+TERMINAL+V2.0)

## ⚡ Features

### 🎤 Advanced Voice Interface
- **Real-time voice recognition** with WebKit Speech API
- **Text-to-speech responses** for immersive interaction
- **Visual voice feedback** with animated indicators
- **Voice command processing** with intelligent parsing

### 🤖 Multi-Model AI Integration
- **OpenAI GPT-4** - Most capable reasoning and analysis
- **OpenAI GPT-3.5 Turbo** - Fast and efficient responses
- **Perplexity AI** - Real-time web search and current events
- **Dynamic model switching** with live configuration

### 🎨 Cyberpunk Interface
- **Neon green terminal** aesthetic with glow effects
- **Animated backgrounds** and particle effects
- **Responsive design** - works on desktop and mobile
- **Terminal-style animations** and transitions
- **Status indicators** with real-time updates

### ⚙️ Advanced Configuration
- **Temperature control** (0.0 - 1.0) for response creativity
- **Token limit settings** (100 - 4000 tokens)
- **Custom system prompts** for specialized interactions
- **Export conversation history** as text files
- **Persistent settings** across sessions

### 💬 Rich Command System
- \/help\ - Display all available commands
- \/settings\ - Open configuration panel
- \/status\ - System diagnostics and health check
- \/models\ - List and switch between AI models
- \/voice on/off\ - Toggle text-to-speech
- \/clear\ - Clear terminal history
- \/history\ - Export conversation log
- \/reset\ - Reset all settings to defaults

## 🚀 Quick Deploy

### One-Click Vercel Deploy
1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Add environment variables (see below)
4. Deploy and enjoy!

### Manual Setup
\\\ash
# Clone repository
git clone https://github.com/duharts/neural-terminal-v2.git
cd neural-terminal-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
\\\

## 🔧 Environment Variables

Add these to your Vercel project or \.env.local\ file:

\\\env
# Required - OpenAI API Key
OPENAI_API_KEY=sk-proj-your-openai-key-here

# Optional - Perplexity API Key (for web search)
PERPLEXITY_API_KEY=pplx-your-perplexity-key-here

# Optional - NextAuth Configuration
NEXTAUTH_SECRET=your-32-character-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
\\\

### Getting API Keys

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create account or sign in
3. Generate new API key
4. Copy key (starts with \sk-proj-\)

#### Perplexity API Key (Optional)
1. Visit [Perplexity AI](https://www.perplexity.ai/settings/api)
2. Sign up or log in
3. Generate API key
4. Copy key (starts with \pplx-\)

## 🎮 Usage Guide

### Voice Commands
1. **Click the microphone button** (positioned under the terminal)
2. **Wait for the "LISTENING" indicator**
3. **Speak your question clearly**
4. **AI responds with text and optional speech**

### Text Commands
- Type any question directly into the input field
- Use \/\ prefix for system commands
- Press Enter or click Send button

### Example Interactions
\\\
User: Explain quantum computing in simple terms
AI: Quantum computing uses quantum mechanical phenomena...

User: /status
System: 🔍 SYSTEM DIAGNOSTICS - All systems operational

User: Write a Python function to sort a list
AI: Here's a Python sorting function...
\\\

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **Icons**: Lucide React icon library
- **AI APIs**: OpenAI GPT models, Perplexity AI
- **Voice**: Web Speech API (recognition & synthesis)
- **Deployment**: Vercel with edge functions
- **State**: React hooks for local state management

## 📁 Project Structure

\\\
neural-terminal-v2/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts      # AI API integration
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main terminal component
│   └── components/               # Reusable components (future)
├── public/                       # Static assets
├── .env.example                  # Environment template
├── tailwind.config.js           # Tailwind configuration
├── next.config.js               # Next.js configuration
└── package.json                 # Dependencies and scripts
\\\

## 🔒 Security & Privacy

- **API keys** stored securely in environment variables
- **No conversation data** stored on servers
- **Client-side processing** for voice recognition
- **HTTPS encryption** for all API communications
- **No tracking** or analytics beyond basic Vercel metrics

## 🎯 Roadmap

### Upcoming Features
- [ ] **Custom voice models** integration
- [ ] **File upload** and document analysis
- [ ] **Code execution** environment
- [ ] **Multi-language** support
- [ ] **Plugin system** for extensions
- [ ] **Dark/light theme** variants
- [ ] **Mobile app** version
- [ ] **Offline mode** capabilities

### Technical Improvements
- [ ] **WebSocket** real-time communication
- [ ] **Database** conversation persistence
- [ ] **User authentication** and profiles
- [ ] **Rate limiting** and usage analytics
- [ ] **Performance optimizations**
- [ ] **Test coverage** improvements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (\git checkout -b feature/AmazingFeature\)
3. Commit your changes (\git commit -m 'Add some AmazingFeature'\)
4. Push to the branch (\git push origin feature/AmazingFeature\)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing GPT models
- **Perplexity AI** for web search capabilities
- **Vercel** for hosting and deployment
- **Next.js team** for the amazing framework
- **Tailwind CSS** for the utility-first styling

---

**Built with ❤️ and ⚡ by [duharts](https://github.com/duharts)**

*Experience the future of AI interaction with Neural Terminal v2.0*
