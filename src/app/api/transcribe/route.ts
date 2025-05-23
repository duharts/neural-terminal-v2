import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[TRANSCRIBE API] Request received')
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      console.error('[TRANSCRIBE API] No audio file provided')
      return NextResponse.json({ 
        error: 'No audio file provided',
        debug: 'FormData did not contain audio field'
      }, { status: 400 })
    }

    console.log(`[TRANSCRIBE API] Audio file received: ${audioFile.name}, size: ${audioFile.size} bytes`)

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('[TRANSCRIBE API] OpenAI API key not configured')
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        debug: 'OPENAI_API_KEY environment variable missing'
      }, { status: 500 })
    }

    console.log('[TRANSCRIBE API] Preparing Whisper API request')
    const whisperFormData = new FormData()
    whisperFormData.append('file', audioFile)
    whisperFormData.append('model', 'whisper-1')
    whisperFormData.append('language', 'en')
    whisperFormData.append('response_format', 'json')
    whisperFormData.append('temperature', '0.2')

    console.log('[TRANSCRIBE API] Calling OpenAI Whisper API')
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[TRANSCRIBE API] Whisper API error ${response.status}:`, errorText)
      throw new Error(`Whisper API error: ${response.status} - ${errorText}`)
    }

    const transcription = await response.json()
    console.log(`[TRANSCRIBE API] Transcription successful: "${transcription.text.substring(0, 50)}..."`)
    
    return NextResponse.json({
      text: transcription.text,
      confidence: 0.95,
      debug: {
        audioSize: audioFile.size,
        transcriptionLength: transcription.text.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[TRANSCRIBE API] Error:', error)
    return NextResponse.json({ 
      error: `Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      debug: {
        error: error instanceof Error ? error.stack : String(error),
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
