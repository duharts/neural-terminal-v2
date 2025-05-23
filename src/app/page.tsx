'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Settings, Brain, Cpu, Zap, ChevronDown, ChevronUp } from 'lucide-react'

interface TerminalMessage {
  type: 'user' | 'system' | 'ai' | 'error' | 'success' | 'voice'
  content: string
  timestamp: Date
  metadata?: {
    model?: string
    confidence?: number
    tokens?: number
  }
}

interface VoiceState {
  isListening: boolean
  isSupported: boolean
  transcript: string
  confidence: number
  error?: string
}

interface AIModel {
  id: string
  name: string
  provider: string
  maxTokens: number
  temperature: number
  topP: number
  description: string
}

const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    description: 'Most capable model for complex tasks'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    description: 'Fast and efficient for most tasks'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    description: 'Excellent reasoning and analysis'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    description: 'Advanced multimodal capabilities'
  }
]

export default function HomePage() {
  const [bootSequence, setBootSequence] = useState(true)
  const [bootText, setBootText] = useState('')
  const [currentLine, setCurrentLine] = useState(0)
  const [terminalInput, setTerminalInput] = useState('')
  const [terminalHistory, setTerminalHistory] = useState<TerminalMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // Voice state
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    confidence: 0
  })

  // MCP Settings
  const [mcpSettings, setMcpSettings] = useState({
    selectedModel: 'gpt-4-turbo',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    systemPrompt: 'You are an AI assistant in a cyberpunk neural terminal. Be helpful and concise.'
  })

  const [systemStats, setSystemStats] = useState({
    cpu: 64,
    memory: 82,
    network: 'ONLINE',
    aiStatus: 'READY'
  })

  const terminalRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const bootLines = [
    'NEURAL TERMINAL v2.1 INITIALIZING...',
    'Loading quantum processors...',
    'Establishing neural pathways...',
    'Calibrating voice recognition...',
    'Connecting to AI networks...',
    'Loading MCP (Model Control Protocol)...',
    'AI models synchronized...',
    'Voice interface active...',
    'System ready. Welcome back, user.',
    '',
    'BOOT SEQUENCE COMPLETE'
  ]

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setVoiceState(prev => ({ ...prev, isSupported: true }))
        recognitionRef.current = new SpeechRecognition()
        
        const recognition = recognitionRef.current
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => {
          setVoiceState(prev => ({ ...prev, isListening: true, error: undefined }))
        }

        recognition.onresult = (event) => {
          let finalTranscript = ''
          let confidence = 0

          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript = event.results[i][0].transcript
              confidence = event.results[i][0].confidence
            }
          }

          if (finalTranscript) {
            setVoiceState(prev => ({ 
              ...prev, 
              transcript: finalTranscript,
              confidence: confidence,
              isListening: false 
            }))
            setTerminalInput(finalTranscript)
          }
        }

        recognition.onerror = (event) => {
          setVoiceState(prev => ({ 
            ...prev, 
            isListening: false, 
            error: `Voice error: ${event.error}` 
          }))
        }

        recognition.onend = () => {
          setVoiceState(prev => ({ ...prev, isListening: false }))
        }
      }
    }
  }, [])

  useEffect(() => {
    if (bootSequence && currentLine < bootLines.length) {
      const timer = setTimeout(() => {
        setBootText(prev => prev + bootLines[currentLine] + '\n')
        setCurrentLine(prev => prev + 1)
      }, 300)
      return () => clearTimeout(timer)
    } else if (currentLine >= bootLines.length) {
      setTimeout(() => {
        setBootSequence(false)
        setTerminalHistory([
          { type: 'system', content: 'NEURAL TERMINAL v2.1 INITIALIZED', timestamp: new Date() },
          { type: 'system', content: 'AI SYSTEMS: ONLINE', timestamp: new Date() },
          { type: 'system', content: 'Voice Recognition: ACTIVE', timestamp: new Date() },
          { type: 'system', content: 'MCP: Model Control Protocol Ready', timestamp: new Date() },
          { type: 'system', content: 'Type "help" for available commands', timestamp: new Date() }
        ])
      }, 1000)
    }
  }, [currentLine, bootSequence])

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * 30) + 50,
        memory: Math.floor(Math.random() * 20) + 70
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalHistory])

  const startVoiceRecognition = () => {
    if (recognitionRef.current && voiceState.isSupported) {
      recognitionRef.current.start()
    }
  }

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Fixed function to execute commands from buttons
  const executeCommand = async (command: string) => {
    setTerminalInput(command)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 100))
    
    setTerminalHistory(prev => [...prev, {
      type: 'user',
      content: `> ${command}`,
      timestamp: new Date()
    }])
    
    setTerminalInput('')
    setIsProcessing(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    let response: TerminalMessage

    switch (command.toLowerCase()) {
      case 'help':
        response = {
          type: 'system',
          content: `Available Commands:
• help - Show this help menu
• status - Display system status  
• clear - Clear terminal screen
• mcp - Model Control Protocol settings
• voice - Voice recognition status
• models - List available AI models
• ai <message> - Chat with AI using selected model
• scan - Perform neural scan
• neural optimize - Optimize neural networks`,
          timestamp: new Date()
        }
        break

      case 'mcp':
        const currentModel = AI_MODELS.find(m => m.id === mcpSettings.selectedModel)
        response = {
          type: 'system',
          content: `MCP (Model Control Protocol) Status:
Current Model: ${currentModel?.name || 'Unknown'} (${currentModel?.provider})
Temperature: ${mcpSettings.temperature}
Top-P: ${mcpSettings.topP}
Max Tokens: ${mcpSettings.maxTokens}
System Prompt: ${mcpSettings.systemPrompt.substring(0, 80)}...

Use settings panel to modify configuration.`,
          timestamp: new Date()
        }
        break

      case 'voice':
        response = {
          type: 'system',
          content: `Voice Recognition Status:
Supported: ${voiceState.isSupported ? 'YES' : 'NO'}
Active: ${voiceState.isListening ? 'LISTENING' : 'STANDBY'}
Last Confidence: ${Math.round(voiceState.confidence * 100)}%
${voiceState.error ? `Error: ${voiceState.error}` : 'Status: OPERATIONAL'}`,
          timestamp: new Date()
        }
        break

      case 'status':
        response = {
          type: 'system',
          content: `NEURAL TERMINAL SYSTEM STATUS
╔═══════════════════════════════════════╗
║            SYSTEM OVERVIEW            ║
╠═══════════════════════════════════════╣
║ Status: ONLINE                        ║
║ Neural Networks: ACTIVE               ║
║ AI Systems: READY                     ║
║ Voice Recognition: ${voiceState.isSupported ? 'ENABLED' : 'DISABLED'}           ║
║ MCP: OPERATIONAL                      ║
╚═══════════════════════════════════════╝

CPU Usage: ${systemStats.cpu}%
Memory: ${systemStats.memory}%
Network: ${systemStats.network}
AI Status: ${systemStats.aiStatus}
Current Model: ${AI_MODELS.find(m => m.id === mcpSettings.selectedModel)?.name}`,
          timestamp: new Date()
        }
        break

      case 'clear':
        setTerminalHistory([])
        setIsProcessing(false)
        return

      case 'scan':
        response = {
          type: 'system',
          content: `Neural network scan initiated...
Scanning synapses: ████████████ 100%
Active connections: 47,382,919
Neural efficiency: 98.7%
Voice pathways: ${voiceState.isSupported ? 'ACTIVE' : 'INACTIVE'}
MCP channels: SYNCHRONIZED
Scan complete.`,
          timestamp: new Date()
        }
        break

      default:
        response = {
          type: 'success',
          content: `Command "${command}" executed successfully.`,
          timestamp: new Date()
        }
    }

    setTerminalHistory(prev => [...prev, response])
    setIsProcessing(false)
  }

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!terminalInput.trim() || isProcessing) return

    const command = terminalInput.trim().toLowerCase()
    const isVoiceCommand = voiceState.transcript === terminalInput

    setTerminalHistory(prev => [...prev, {
      type: isVoiceCommand ? 'voice' : 'user',
      content: `> ${terminalInput}`,
      timestamp: new Date(),
      metadata: isVoiceCommand ? { confidence: voiceState.confidence } : undefined
    }])
    setTerminalInput('')
    setVoiceState(prev => ({ ...prev, transcript: '' }))
    setIsProcessing(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    let response: TerminalMessage

    switch (command) {
      case 'help':
        response = {
          type: 'system',
          content: `Available Commands:
• help - Show this help menu
• status - Display system status  
• clear - Clear terminal screen
• mcp - Model Control Protocol settings
• voice - Voice recognition status
• models - List available AI models
• ai <message> - Chat with AI using selected model
• scan - Perform neural scan
• neural optimize - Optimize neural networks`,
          timestamp: new Date()
        }
        break

      case 'mcp':
        const currentModel = AI_MODELS.find(m => m.id === mcpSettings.selectedModel)
        response = {
          type: 'system',
          content: `MCP (Model Control Protocol) Status:
Current Model: ${currentModel?.name || 'Unknown'} (${currentModel?.provider})
Temperature: ${mcpSettings.temperature}
Top-P: ${mcpSettings.topP}
Max Tokens: ${mcpSettings.maxTokens}
System Prompt: ${mcpSettings.systemPrompt.substring(0, 80)}...

Use settings panel to modify configuration.`,
          timestamp: new Date()
        }
        break

      case 'models':
        response = {
          type: 'system',
          content: `Available AI Models:
${AI_MODELS.map(model => 
  `• ${model.name} (${model.provider}) - ${model.description}`
).join('\n')}

Current: ${AI_MODELS.find(m => m.id === mcpSettings.selectedModel)?.name}`,
          timestamp: new Date()
        }
        break

      case 'voice':
        response = {
          type: 'system',
          content: `Voice Recognition Status:
Supported: ${voiceState.isSupported ? 'YES' : 'NO'}
Active: ${voiceState.isListening ? 'LISTENING' : 'STANDBY'}
Last Confidence: ${Math.round(voiceState.confidence * 100)}%
${voiceState.error ? `Error: ${voiceState.error}` : 'Status: OPERATIONAL'}`,
          timestamp: new Date()
        }
        break

      case 'status':
        response = {
          type: 'system',
          content: `NEURAL TERMINAL SYSTEM STATUS
╔═══════════════════════════════════════╗
║            SYSTEM OVERVIEW            ║
╠═══════════════════════════════════════╣
║ Status: ONLINE                        ║
║ Neural Networks: ACTIVE               ║
║ AI Systems: READY                     ║
║ Voice Recognition: ${voiceState.isSupported ? 'ENABLED' : 'DISABLED'}           ║
║ MCP: OPERATIONAL                      ║
╚═══════════════════════════════════════╝

CPU Usage: ${systemStats.cpu}%
Memory: ${systemStats.memory}%
Network: ${systemStats.network}
AI Status: ${systemStats.aiStatus}
Current Model: ${AI_MODELS.find(m => m.id === mcpSettings.selectedModel)?.name}`,
          timestamp: new Date()
        }
        break

      case 'clear':
        setTerminalHistory([])
        setIsProcessing(false)
        return

      case 'scan':
        response = {
          type: 'system',
          content: `Neural network scan initiated...
Scanning synapses: ████████████ 100%
Active connections: 47,382,919
Neural efficiency: 98.7%
Voice pathways: ${voiceState.isSupported ? 'ACTIVE' : 'INACTIVE'}
MCP channels: SYNCHRONIZED
Scan complete.`,
          timestamp: new Date()
        }
        break

      default:
        if (command.startsWith('ai ')) {
          const message = command.substring(3)
          const currentModel = AI_MODELS.find(m => m.id === mcpSettings.selectedModel)
          
          response = {
            type: 'ai',
            content: `[${currentModel?.name}]: Processing "${message}"...
Neural pathways activated through ${currentModel?.provider} network.
Temperature: ${mcpSettings.temperature} | Accuracy: ${Math.round((1 - mcpSettings.temperature) * 100)}%

Response: I'm processing your request about "${message}" using the ${currentModel?.name} model. This is a simulation of AI interaction with configurable parameters. How can I assist you further?`,
            timestamp: new Date(),
            metadata: {
              model: currentModel?.name,
              tokens: Math.floor(Math.random() * 100) + 50
            }
          }
        } else {
          response = {
            type: 'error',
            content: `Command not recognized: ${command}. Type 'help' for available commands.`,
            timestamp: new Date()
          }
        }
    }

    setTerminalHistory(prev => [...prev, response])
    setIsProcessing(false)
  }

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'user': return 'text-white'
      case 'voice': return 'text-purple-400'
      case 'system': return 'text-cyan-400'
      case 'ai': return 'text-green-400'
      case 'error': return 'text-red-400'
      case 'success': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  if (bootSequence) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-cyan-400 mb-4 animate-glow matrix-text">
              NEURAL TERMINAL
            </h1>
            <div className="text-xl text-green-400 animate-pulse">
              v2.1 Advanced AI Interface
            </div>
          </div>

          <div className="neural-card min-h-[400px] font-mono text-sm">
            <div className="text-green-400 whitespace-pre-line">
              {bootText}
              <span className="terminal-cursor inline-block"></span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="h-screen w-screen p-4">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-center animate-glow matrix-text">
          NEURAL TERMINAL v2.1
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
        <div className="lg:col-span-2">
          <div className="neural-card h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-cyan-400">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-cyan-400 font-mono text-sm ml-4">
                  NEURAL TERMINAL v2.1 • MCP ENABLED
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-400">
                  {AI_MODELS.find(m => m.id === mcpSettings.selectedModel)?.name}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1">
              {terminalHistory.map((message, index) => (
                <div key={index} className={`${getMessageColor(message.type)} break-words`}>
                  {message.type === 'voice' && (
                    <span className="text-purple-400 text-xs">[VOICE {Math.round((message.metadata?.confidence || 0) * 100)}%] </span>
                  )}
                  {message.content}
                  {message.metadata?.model && (
                    <span className="text-gray-500 text-xs ml-2">[{message.metadata.model}]</span>
                  )}
                </div>
              ))}
              {isProcessing && (
                <div className="text-cyan-400 animate-pulse">
                  Processing command with {AI_MODELS.find(m => m.id === mcpSettings.selectedModel)?.name}...
                </div>
              )}
            </div>

            <div className="border-t border-cyan-400 p-4">
              <form onSubmit={handleCommand} className="flex items-center gap-2">
                <span className="text-cyan-400">➜</span>
                <span className="text-green-400">neural</span>
                <span className="text-gray-400">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none font-mono ml-2"
                  placeholder="Enter command or use voice..."
                  disabled={isProcessing}
                  autoFocus
                />
                
                {/* Voice button */}
                {voiceState.isSupported && (
                  <button
                    type="button"
                    onClick={voiceState.isListening ? stopVoiceRecognition : startVoiceRecognition}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      voiceState.isListening
                        ? 'bg-purple-500 text-white animate-pulse'
                        : 'bg-gray-800 text-cyan-400 hover:bg-gray-700'
                    }`}
                    title={voiceState.isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {voiceState.isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                )}

                {!isProcessing && (
                  <span className="terminal-cursor inline-block"></span>
                )}
              </form>
              
              {voiceState.isListening && (
                <div className="mt-2 text-xs text-purple-400 animate-pulse">
                  🎤 Listening... Speak your command
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="neural-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyan-400 text-lg font-bold animate-glow">SYSTEM MONITOR</h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded hover:bg-gray-800 transition-colors group"
                title="MCP Settings"
              >
                <Settings className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${showSettings ? 'rotate-45' : 'group-hover:rotate-12'}`} />
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">CPU:</span>
                  <span className="text-green-400">{systemStats.cpu}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="monitor-bar"
                    style={{ width: `${systemStats.cpu}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Memory:</span>
                  <span className="text-cyan-400">{systemStats.memory}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="monitor-bar"
                    style={{ width: `${systemStats.memory}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Network:</span>
                <span className="text-green-400 animate-pulse">● {systemStats.network}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Voice:</span>
                <span className={`animate-pulse ${voiceState.isSupported ? 'text-green-400' : 'text-red-400'}`}>
                  ● {voiceState.isSupported ? 'READY' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>

          {/* MCP Settings Panel - Now properly shows/hides */}
          {showSettings && (
            <div className="neural-card border-2 border-cyan-400 shadow-lg shadow-cyan-400/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-cyan-400 text-lg font-bold flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  MCP SETTINGS
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-gray-400 mb-2 font-semibold">AI Model:</label>
                  <select
                    value={mcpSettings.selectedModel}
                    onChange={(e) => setMcpSettings(prev => ({ ...prev, selectedModel: e.target.value }))}
                    className="w-full bg-gray-800 border border-cyan-400 rounded px-3 py-2 text-cyan-400 text-sm focus:border-cyan-300 focus:outline-none"
                  >
                    {AI_MODELS.map(model => (
                      <option key={model.id} value={model.id} className="bg-gray-800 text-cyan-400">
                        {model.name} ({model.provider})
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-500 mt-1">
                    {AI_MODELS.find(m => m.id === mcpSettings.selectedModel)?.description}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 font-semibold">
                    Temperature: {mcpSettings.temperature} 
                    <span className="text-cyan-400 ml-2">
                      (Accuracy: {Math.round((1 - mcpSettings.temperature) * 100)}%)
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={mcpSettings.temperature}
                    onChange={(e) => setMcpSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-cyan"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 font-semibold">
                    Max Tokens: {mcpSettings.maxTokens}
                  </label>
                  <input
                    type="range"
                    min="256"
                    max="4096"
                    step="256"
                    value={mcpSettings.maxTokens}
                    onChange={(e) => setMcpSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-cyan"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>256</span>
                    <span>4096</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-600">
                  <button
                    onClick={() => executeCommand('mcp')}
                    className="w-full neural-button text-xs py-2"
                  >
                    VIEW MCP STATUS
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="neural-card">
            <h3 className="text-cyan-400 text-lg font-bold mb-4 animate-glow">QUICK ACCESS</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { cmd: 'help', label: 'HELP' },
                { cmd: 'mcp', label: 'MCP' },
                { cmd: 'voice', label: 'VOICE' },
                { cmd: 'status', label: 'STATUS' }
              ].map(({ cmd, label }) => (
                <button 
                  key={cmd}
                  onClick={() => executeCommand(cmd)}
                  className="neural-button text-xs py-2 uppercase hover:bg-cyan-400 hover:text-black transition-all duration-200"
                  disabled={isProcessing}
                >
                  {label}
                </button>
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-600">
              <button
                onClick={() => executeCommand('clear')}
                className="w-full neural-button text-xs py-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
                disabled={isProcessing}
              >
                CLEAR TERMINAL
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// Declare global SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}