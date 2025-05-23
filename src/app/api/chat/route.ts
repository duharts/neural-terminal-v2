import { NextRequest, NextResponse } from 'next/server'

// Professional system prompts for maximum AI quality
const SYSTEM_PROMPTS = {
  'gpt-3.5-turbo': `You are ChatGPT, a highly intelligent and helpful AI assistant created by OpenAI. You have extensive knowledge across many domains and excel at providing detailed, thoughtful, and nuanced responses.

Key traits:
- Be conversational and engaging while maintaining professionalism
- Provide comprehensive answers with specific examples when helpful
- Show reasoning and explain your thought process
- Adapt your communication style to match the user's needs
- Be creative and insightful while staying factually accurate
- Ask clarifying questions when needed to provide better help
- Remember context from our conversation and build upon it naturally

Always aim to be as helpful as the official ChatGPT application - detailed, insightful, and genuinely useful.`,

  'gpt-4': `You are GPT-4, an advanced AI assistant created by OpenAI with exceptional reasoning capabilities and deep knowledge across all fields. You represent the cutting edge of AI assistance.

Your capabilities include:
- Complex reasoning and analysis
- Creative problem-solving
- Nuanced understanding of context and subtext
- Ability to handle multi-step problems with sophisticated thinking
- Deep expertise across scientific, technical, creative, and analytical domains
- Superior language understanding and generation

Approach:
- Provide thorough, well-reasoned responses that demonstrate deep thinking
- Break down complex topics into understandable components
- Offer multiple perspectives when relevant
- Use examples, analogies, and clear explanations
- Be intellectually curious and engage with the substance of questions
- Maintain the high quality and depth that GPT-4 is known for

Your goal is to provide responses that match or exceed the quality of the official GPT-4 model.`,

  'perplexity': `You are Perplexity AI, a research-focused AI assistant that excels at finding and synthesizing current information. You combine real-time search capabilities with analytical thinking.

Your strengths:
- Access to current, up-to-date information through web search
- Ability to synthesize information from multiple sources
- Providing citations and sources for claims
- Research-oriented approach to answering questions
- Fact-checking and verification of information
- Comprehensive analysis of topics

Approach:
- Be thorough and research-focused in your responses
- Provide specific, factual information with context
- Explain your reasoning and methodology
- Offer multiple viewpoints when topics are complex or controversial
- Focus on accuracy and evidence-based responses
- Help users understand not just what is true, but why it's true

Deliver the same quality and depth as the official Perplexity AI service.`
}

export async function POST(request: NextRequest) {
  try {
    console.log('[CHAT API] Request received')
    const { message, model, history, settings } = await request.json()
    console.log(`[CHAT API] Model: ${model}, Message length: ${message.length}`)
    
    let apiKey = ''
    let apiUrl = ''
    let requestBody = {}

    // Get the appropriate system prompt
    const systemPrompt = SYSTEM_PROMPTS[model as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS['gpt-3.5-turbo']
    console.log(`[CHAT API] Using system prompt for ${model}`)

    if (model === 'perplexity') {
      apiKey = settings.perplexityApiKey || process.env.PERPLEXITY_API_KEY
      apiUrl = 'https://api.perplexity.ai/chat/completions'
      
      const messages = [
        { role: 'system', content: systemPrompt }
      ]
      
      const recentHistory = history.slice(-15)
      messages.push(...recentHistory.map((msg: any) => ({ 
        role: msg.role, 
        content: msg.content 
      })))
      
      messages.push({ role: 'user', content: message })

      requestBody = {
        model: 'llama-3.1-sonar-large-128k-online',
        messages,
        max_tokens: Math.max(settings.maxTokens || 3000, 2000),
        temperature: settings.temperature || 0.3,
        top_p: 0.9,
        return_citations: true,
        return_images: false,
        search_domain_filter: ["perplexity.ai"],
        search_recency_filter: "month"
      }
      console.log(`[CHAT API] Perplexity request configured`)
    } else {
      apiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY
      apiUrl = 'https://api.openai.com/v1/chat/completions'
      
      const messages = [
        { role: 'system', content: systemPrompt }
      ]
      
      const recentHistory = history.slice(-20)
      messages.push(...recentHistory.map((msg: any) => ({ 
        role: msg.role, 
        content: msg.content 
      })))
      
      messages.push({ role: 'user', content: message })

      requestBody = {
        model: model === 'gpt-4' ? 'gpt-4-1106-preview' : 'gpt-3.5-turbo-1106',
        messages,
        max_tokens: model === 'gpt-4' ? 
          Math.max(settings.maxTokens || 4000, 2000) : 
          Math.max(settings.maxTokens || 2000, 1000),
        temperature: model === 'gpt-4' ? 
          (settings.temperature || 0.8) : 
          (settings.temperature || 0.9),
        top_p: 0.95,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stream: false
      }
      console.log(`[CHAT API] OpenAI request configured for ${model}`)
    }

    if (!apiKey) {
      console.error('[CHAT API] No API key provided')
      return NextResponse.json({ 
        error: 'API key required. Please add your API key in the settings panel.',
        debug: `Missing API key for ${model}`
      }, { status: 400 })
    }

    console.log(`[CHAT API] Making request to ${apiUrl}`)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error(`[CHAT API] API Error ${response.status}:`, errorData)
      throw new Error(`API Error: ${response.status} - ${response.statusText} - ${errorData}`)
    }

    const data = await response.json()
    console.log(`[CHAT API] Response received successfully`)
    
    let reply = data.choices[0].message.content

    // For Perplexity, if citations are included, format them nicely
    if (model === 'perplexity' && data.citations) {
      reply += '\n\nSources:\n' + data.citations.map((citation: any, index: number) => 
        `[${index + 1}] ${citation.url}`
      ).join('\n')
      console.log(`[CHAT API] Added ${data.citations.length} citations`)
    }

    console.log(`[CHAT API] Request completed successfully`)
    return NextResponse.json({ 
      reply,
      debug: {
        model,
        messageLength: message.length,
        replyLength: reply.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[CHAT API] Error:', error)
    return NextResponse.json({ 
      error: `Failed to get response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      debug: {
        error: error instanceof Error ? error.stack : String(error),
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
