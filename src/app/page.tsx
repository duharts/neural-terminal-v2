'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Settings, Brain, Key, ChevronUp, Send, Loader, Menu, X } from 'lucide-react'

interface TerminalMessage {
  type: 'user' | 'system' | 'ai' | 'error' | 'success' | 'voice' | 'whisper'
  content: string
  timestamp: Date
  metadata?: {
    model?: string
    confidence?: number
    tokens?: number
    audioUrl?: string
  }
}

interface VoiceState {
  isListening: boolean
  isRecording: boolean
  isProcessing: boolean
  isSupported: boolean
  transcript: string
  confidence: number
  error?: string
  audioBlob?: Blob
}

interface AIModel {
  id: string
  name: string
  provider: string
  apiEndpoint: string
  maxTokens: number
  temperature: number
  description: string
}

interface APIKeys {
  openai: string
  anthropic: string
  google: string
  whisper: string
}

const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 4096,
    temperature: 0.7,
    description: 'Most capable model for complex reasoning and analysis'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 4096,
    temperature: 0.7,
    description: 'Fast and efficient for most conversational tasks'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    maxTokens: 4096,
    temperature: 0.7,
    description: 'Excellent for detailed analysis and creative tasks'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    maxTokens: 4096,
    temperature: 0.7,
    description: 'Balanced performance for everyday AI tasks'
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
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // Voice state
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isRecording: false,
    isProcessing: false,
    isSupported: false,
    transcript: '',
    confidence: 0
  })

  // API Keys (stored in localStorage)
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    openai: '',
    anthropic: '',
    google: '',
    whisper: ''
  })

  // MCP Settings
  const [mcpSettings, setMcpSettings] = useState({
    selectedModel: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'You are an advanced AI assistant in a cyberpunk neural terminal. Be helpful, concise, and maintain the futuristic atmosphere. You can discuss any topic and help with various tasks.'
  })

  const [systemStats, setSystemStats] = useState({
    cpu: 64,
    memory: 82,
    network: 'ONLINE',
    aiStatus: 'READY'
  })

  const terminalRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const bootLines = [
    'NEURAL TERMINAL v2.1 INITIALIZING...',
    'Loading quantum processors...',
    'Establishing neural pathways...',
    'Calibrating voice recognition...',
    'Connecting to AI networks...',
    'Loading Whisper transcription...',
    'Initializing real-time LLM integration...',
    'MCP (Model Control Protocol) ready...',
    'API endpoints synchronized...',
    'Voice interface active...',
    'System ready. Neural pathways online.',
    '',
    'BOOT SEQUENCE COMPLETE'
  ]

  // Load API keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('neural-terminal-api-keys')
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys))
      } catch (error) {
        console.error('Failed to load API keys:', error)
      }
    }
  }, [])

  // Save API keys to localStorage
  const saveApiKeys = (keys: APIKeys) => {
    setApiKeys(keys)
    localStorage.setItem('neural-terminal-api-keys', JSON.stringify(keys))
  }

  // Initialize voice recognition and recording
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for speech recognition support
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
          { type: 'system', content: 'Real-time LLM integration: ACTIVE', timestamp: new Date() },
          { type: 'system', content: 'Whisper transcription: READY', timestamp: new Date() },
          { type: 'system', content: 'Voice recognition: ENABLED', timestamp: new Date() },
          { type: 'system', content: 'Type any message to chat with AI or use voice input', timestamp: new Date() },
          { type: 'system', content: 'Commands: help, status, settings, clear', timestamp: new Date() }
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

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalHistory])

  // Rest of the component code continues...
  // (The rest would be included in the actual file)

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Mobile-optimized interface */}
      <div className="p-2 sm:p-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-center text-cyan-400 mb-4">
          NEURAL TERMINAL v2.1
        </h1>
        {/* Rest of mobile-optimized UI */}
      </div>
    </main>
  )
}