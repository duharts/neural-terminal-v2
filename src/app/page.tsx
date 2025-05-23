'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Settings, Brain, Key, ChevronUp, Send, Loader } from 'lucide-react'

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

  // Start audio recording for Whisper
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setVoiceState(prev => ({ ...prev, audioBlob, isRecording: false, isProcessing: true }))
        
        // Send to Whisper for transcription
        await transcribeWithWhisper(audioBlob)
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setVoiceState(prev => ({ ...prev, isRecording: true }))
    } catch (error) {
      setVoiceState(prev => ({ 
        ...prev, 
        error: `Recording failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }))
    }
  }

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  // Transcribe audio with Whisper API
  const transcribeWithWhisper = async (audioBlob: Blob) => {
    if (!apiKeys.openai && !apiKeys.whisper) {
      setVoiceState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: 'OpenAI API key required for Whisper transcription' 
      }))
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.wav')
      formData.append('model', 'whisper-1')

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeys.openai || apiKeys.whisper}`,
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status}`)
      }

      const result = await response.json()
      const transcript = result.text

      setVoiceState(prev => ({ 
        ...prev, 
        transcript,
        isProcessing: false,
        confidence: 0.95 // Whisper doesn't provide confidence, assume high
      }))

      setTerminalInput(transcript)

      // Add whisper transcription to history
      setTerminalHistory(prev => [...prev, {
        type: 'whisper',
        content: `[WHISPER] Transcribed: "${transcript}"`,
        timestamp: new Date(),
        metadata: { confidence: 0.95 }
      }])

    } catch (error) {
      setVoiceState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: `Whisper failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }))
    }
  }

  // Send message to selected LLM
  const sendToLLM = async (message: string, isVoiceCommand = false) => {
    const currentModel = AI_MODELS.find(m => m.id === mcpSettings.selectedModel)
    if (!currentModel) {
      throw new Error('No model selected')
    }

    // Check for API key
    const apiKey = currentModel.provider === 'OpenAI' ? apiKeys.openai :
                   currentModel.provider === 'Anthropic' ? apiKeys.anthropic :
                   apiKeys.google

    if (!apiKey) {
      throw new Error(`${currentModel.provider} API key required`)
    }

    let requestBody: any
    let headers: any = {
      'Content-Type': 'application/json'
    }

    if (currentModel.provider === 'OpenAI') {
      headers['Authorization'] = `Bearer ${apiKey}`
      requestBody = {
        model: currentModel.id,
        messages: [
          { role: 'system', content: mcpSettings.systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: mcpSettings.maxTokens,
        temperature: mcpSettings.temperature
      }
    } else if (currentModel.provider === 'Anthropic') {
      headers['x-api-key'] = apiKey
      headers['anthropic-version'] = '2023-06-01'
      requestBody = {
        model: currentModel.id,
        max_tokens: mcpSettings.maxTokens,
        temperature: mcpSettings.temperature,
        system: mcpSettings.systemPrompt,
        messages: [{ role: 'user', content: message }]
      }
    }

    const response = await fetch(currentModel.apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`${currentModel.provider} API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    // Extract response based on provider
    let content = ''
    let tokens = 0

    if (currentModel.provider === 'OpenAI') {
      content = result.choices?.[0]?.message?.content || 'No response'
      tokens = result.usage?.total_tokens || 0
    } else if (currentModel.provider === 'Anthropic') {
      content = result.content?.[0]?.text || 'No response'
      tokens = result.usage?.input_tokens + result.usage?.output_tokens || 0
    }

    return { content, tokens }
  }

  const executeCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim()
    
    // System commands
    if (cmd === 'help') {
      return {
        type: 'system' as const,
        content: `NEURAL TERMINAL v2.1 - Command Reference:

CHAT COMMANDS:
ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Type any message to chat with the selected AI model
ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Use voice input with microphone for hands-free interaction

SYSTEM COMMANDS:
ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ help - Show this command reference
ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ status - Display detailed system status
ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ clear - Clear terminal history
ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ settings - Open/close MCP settings panel
ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ apikeys - Open/close API key management

VOICE COMMANDS:
ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Click microphone to record audio
ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Audio is transcribed via Whisper API
ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Transcription is sent to selected LLM

Current Model: ${AI_MODELS.find(m => m.id === mcpSettings.selectedModel)?.name}
Temperature: ${mcpSettings.temperature} (Creativity: ${Math.round(mcpSettings.temperature * 100)}%)`,
        timestamp: new Date()
      }
    }

    if (cmd === 'status') {
      const hasOpenAI = !!apiKeys.openai
      const hasAnthropic = !!apiKeys.anthropic
      const currentModel = AI_MODELS.find(m => m.id === mcpSettings.selectedModel)
      
      return {
        type: 'system' as const,
        content: `NEURAL TERMINAL SYSTEM STATUS
ÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬â€
ÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬Ëœ            SYSTEM OVERVIEW            ÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬Ëœ
ÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â£
ÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬Ëœ Status: ONLINE                        ÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬Ëœ
ÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬Ëœ LLM Integration: ACTIVE               ÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬Ëœ
ÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬Ëœ Whisper Transcription: ${hasOpenAI ? 'READY' : 'NO API KEY'}        ÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬Ëœ
ÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬Ëœ Voice Recognition: ${voiceState.isSupported ? 'ENABLED' : 'DISABLED'}           ÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬Ëœ
ÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬Ëœ MCP: OPERATIONAL                      ÃƒÂ¢Ã¢â‚¬Â¢Ã¢â‚¬Ëœ
ÃƒÂ¢Ã¢â‚¬Â¢Ã…Â¡ÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚ÂÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â

SYSTEM RESOURCES:
CPU Usage: ${systemStats.cpu}%
Memory: ${systemStats.memory}%
Network: ${systemStats.network}

AI CONFIGURATION:
Current Model: ${currentModel?.name}
Provider: ${currentModel?.provider}
Temperature: ${mcpSettings.temperature}
Max Tokens: ${mcpSettings.maxTokens}

API KEYS STATUS:
OpenAI: ${hasOpenAI ? 'ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ CONFIGURED' : 'ÃƒÂ¢Ã‚ÂÃ…â€™ MISSING'}
Anthropic: ${hasAnthropic ? 'ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ CONFIGURED' : 'ÃƒÂ¢Ã‚ÂÃ…â€™ MISSING'}

VOICE FEATURES:
Browser Support: ${voiceState.isSupported ? 'YES' : 'NO'}
Last Confidence: ${Math.round(voiceState.confidence * 100)}%`,
        timestamp: new Date()
      }
    }

    if (cmd === 'clear') {
      return null // Signal to clear
    }

    if (cmd === 'settings') {
      setShowSettings(!showSettings)
      return {
        type: 'system' as const,
        content: `Settings panel ${showSettings ? 'closed' : 'opened'}`,
        timestamp: new Date()
      }
    }

    if (cmd === 'apikeys') {
      setShowApiKeys(!showApiKeys)
      return {
        type: 'system' as const,
        content: `API key management ${showApiKeys ? 'closed' : 'opened'}`,
        timestamp: new Date()
      }
    }

    // If not a system command, send to LLM
    try {
      const { content, tokens } = await sendToLLM(command)
      const currentModel = AI_MODELS.find(m => m.id === mcpSettings.selectedModel)
      
      return {
        type: 'ai' as const,
        content,
        timestamp: new Date(),
        metadata: {
          model: currentModel?.name,
          tokens
        }
      }
    } catch (error) {
      return {
        type: 'error' as const,
        content: `LLM Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }
    }
  }

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!terminalInput.trim() || isProcessing) return

    const isVoiceCommand = voiceState.transcript === terminalInput

    setTerminalHistory(prev => [...prev, {
      type: isVoiceCommand ? 'voice' : 'user',
      content: terminalInput,
      timestamp: new Date(),
      metadata: isVoiceCommand ? { confidence: voiceState.confidence } : undefined
    }])

    const command = terminalInput
    setTerminalInput('')
    setVoiceState(prev => ({ ...prev, transcript: '' }))
    setIsProcessing(true)

    try {
      const response = await executeCommand(command)
      
      if (response === null) {
        // Clear command
        setTerminalHistory([])
      } else {
        setTerminalHistory(prev => [...prev, response])
      }
    } catch (error) {
      setTerminalHistory(prev => [...prev, {
        type: 'error',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }])
    } finally {
      setIsProcessing(false)
    }
  }

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'user': return 'text-white'
      case 'voice': return 'text-purple-400'
      case 'whisper': return 'text-blue-400'
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
              v2.1 AI Integration Active
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
    <main className="h-screen w-screen p-4 overflow-hidden">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-center animate-glow matrix-text">
          NEURAL TERMINAL v2.1
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="neural-card h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-cyan-400 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-cyan-400 font-mono text-sm ml-4">
                  NEURAL TERMINAL v2.1 ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ LLM ACTIVE
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

            <div 
              ref={terminalRef} 
              className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1 scrollbar-thin scrollbar-thumb-cyan-400 scrollbar-track-gray-800"
              style={{ maxHeight: 'calc(100vh - 300px)' }}
            >
              {terminalHistory.map((message, index) => (
                <div key={index} className={`${getMessageColor(message.type)} break-words`}>
                  <span className="text-gray-500 text-xs">
                    [{message.timestamp.toLocaleTimeString()}]
                  </span>
                  {message.type === 'voice' && (
                    <span className="text-purple-400 text-xs ml-2">
                      [VOICE {Math.round((message.metadata?.confidence || 0) * 100)}%]
                    </span>
                  )}
                  {message.type === 'whisper' && (
                    <span className="text-blue-400 text-xs ml-2">
                      [WHISPER]
                    </span>
                  )}
                  {message.type === 'user' && (
                    <span className="text-white ml-2">USER:</span>
                  )}
                  {message.type === 'ai' && (
                    <span className="text-green-400 ml-2">
                      [{message.metadata?.model || 'AI'}]:
                    </span>
                  )}
                  <div className="ml-2 mt-1 whitespace-pre-wrap">
                    {message.content}
                  </div>
                  {message.metadata?.tokens && (
                    <span className="text-gray-500 text-xs ml-2">
                      [{message.metadata.tokens} tokens]
                    </span>
                  )}
                </div>
              ))}
              {isProcessing && (
                <div className="text-cyan-400 animate-pulse flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing with {AI_MODELS.find(m => m.id === mcpSettings.selectedModel)?.name}...
                </div>
              )}
              {voiceState.isProcessing && (
                <div className="text-blue-400 animate-pulse flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Transcribing audio with Whisper...
                </div>
              )}
            </div>

            <div className="border-t border-cyan-400 p-4 flex-shrink-0">
              <form onSubmit={handleCommand} className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-cyan-400">ÃƒÂ¢Ã…Â¾Ã…â€œ</span>
                  <span className="text-green-400">neural</span>
                  <span className="text-gray-400">$</span>
                </div>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none font-mono ml-2"
                  placeholder="Chat with AI or enter command..."
                  disabled={isProcessing}
                  autoFocus
                />
                
                {/* Voice buttons */}
                {voiceState.isSupported && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={voiceState.isRecording ? stopAudioRecording : startAudioRecording}
                      className={`p-2 rounded-md transition-all duration-200 text-xs ${
                        voiceState.isRecording
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-gray-800 text-orange-400 hover:bg-gray-700'
                      }`}
                      title={voiceState.isRecording ? 'Stop recording (Whisper)' : 'Record audio (Whisper)'}
                      disabled={voiceState.isProcessing}
                    >
                      {voiceState.isRecording ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!terminalInput.trim() || isProcessing}
                  className="p-2 rounded-md bg-cyan-400 text-black hover:bg-cyan-300 transition-colors disabled:opacity-50"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              
              {voiceState.isRecording && (
                <div className="mt-2 text-xs text-red-400 animate-pulse">
                  ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â€žÂ¢ÃƒÂ¯Ã‚Â¸Ã‚Â Recording audio for Whisper transcription...
                </div>
              )}
              
              {voiceState.error && (
                <div className="mt-2 text-xs text-red-400">
                  ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â {voiceState.error}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-full">
          <div className="neural-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyan-400 text-lg font-bold animate-glow">SYSTEM MONITOR</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="p-1 rounded hover:bg-gray-800 transition-colors"
                  title="API Keys"
                >
                  <Key className="w-4 h-4 text-yellow-400" />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 rounded hover:bg-gray-800 transition-colors"
                  title="MCP Settings"
                >
                  <Settings className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${showSettings ? 'rotate-45' : ''}`} />
                </button>
              </div>
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
                <span className="text-gray-400">LLM:</span>
                <span className="text-green-400 animate-pulse">ÃƒÂ¢Ã¢â‚¬â€Ã‚Â ACTIVE</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Whisper:</span>
                <span className={`animate-pulse ${apiKeys.openai ? 'text-green-400' : 'text-red-400'}`}>
                  ÃƒÂ¢Ã¢â‚¬â€Ã‚Â {apiKeys.openai ? 'READY' : 'NO KEY'}
                </span>
              </div>
            </div>
          </div>

          {/* API Keys Panel */}
          {showApiKeys && (
            <div className="neural-card border-2 border-yellow-400 shadow-lg shadow-yellow-400/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-400 text-lg font-bold flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API KEYS
                </h3>
                <button
                  onClick={() => setShowApiKeys(false)}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">OpenAI API Key:</label>
                  <input
                    type="password"
                    value={apiKeys.openai}
                    onChange={(e) => saveApiKeys({ ...apiKeys, openai: e.target.value })}
                    placeholder="sk-..."
                    className="w-full bg-gray-800 border border-yellow-400 rounded px-2 py-1 text-yellow-400 text-xs"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Used for GPT models and Whisper transcription
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Anthropic API Key:</label>
                  <input
                    type="password"
                    value={apiKeys.anthropic}
                    onChange={(e) => saveApiKeys({ ...apiKeys, anthropic: e.target.value })}
                    placeholder="sk-ant-..."
                    className="w-full bg-gray-800 border border-yellow-400 rounded px-2 py-1 text-yellow-400 text-xs"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Used for Claude models
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MCP Settings Panel */}
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
                    className="w-full bg-gray-800 border border-cyan-400 rounded px-3 py-2 text-cyan-400 text-sm"
                  >
                    {AI_MODELS.map(model => (
                      <option key={model.id} value={model.id} className="bg-gray-800">
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
                      (Creativity: {Math.round(mcpSettings.temperature * 100)}%)
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={mcpSettings.temperature}
                    onChange={(e) => setMcpSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
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
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 font-semibold">System Prompt:</label>
                  <textarea
                    value={mcpSettings.systemPrompt}
                    onChange={(e) => setMcpSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    className="w-full bg-gray-800 border border-cyan-400 rounded px-2 py-1 text-cyan-400 text-xs"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="neural-card">
            <h3 className="text-cyan-400 text-lg font-bold mb-4 animate-glow">QUICK ACCESS</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { cmd: 'help', label: 'HELP' },
                { cmd: 'status', label: 'STATUS' },
                { cmd: 'settings', label: 'SETTINGS' },
                { cmd: 'clear', label: 'CLEAR' }
              ].map(({ cmd, label }) => (
                <button 
                  key={cmd}
                  onClick={() => {
                    setTerminalInput(cmd)
                    setTimeout(() => {
                      const form = document.querySelector('form')
                      if (form) {
                        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
                      }
                    }, 100)
                  }}
                  className="neural-button text-xs py-2 uppercase"
                  disabled={isProcessing}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}