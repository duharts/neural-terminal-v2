export interface TerminalMessage {
  type: 'user' | 'system' | 'ai' | 'error' | 'success' | 'voice'
  content: string
  timestamp: Date
  metadata?: {
    model?: string
    confidence?: number
    tokens?: number
  }
}

export interface VoiceState {
  isListening: boolean
  isSupported: boolean
  transcript: string
  confidence: number
  error?: string
}

export interface AIModel {
  id: string
  name: string
  provider: string
  maxTokens: number
  temperature: number
  topP: number
  description: string
}

export interface MCPSettings {
  selectedModel: string
  temperature: number
  topP: number
  maxTokens: number
  systemPrompt: string
}