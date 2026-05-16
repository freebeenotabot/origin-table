import { NextRequest, NextResponse } from 'next/server'

// Rachel voice — warm, professional, handles eleven_multilingual_v2 well
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'
const ELEVENLABS_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`

// In-memory cache: survives the demo session, resets on server restart (fine for hackathon)
const audioCache = new Map<string, string>()

export async function POST(request: NextRequest) {
  const { term, language } = await request.json() as { term: string; language: string }

  if (!term) {
    return NextResponse.json({ error: 'term is required' }, { status: 400 })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 })
  }

  const cacheKey = `${term}:${language}`
  const cached = audioCache.get(cacheKey)
  if (cached) {
    return NextResponse.json({ audioBase64: cached, cached: true })
  }

  const res = await fetch(ELEVENLABS_URL, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: term,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('ElevenLabs error:', res.status, errorText)
    return NextResponse.json({ error: 'ElevenLabs request failed' }, { status: 502 })
  }

  const buffer = await res.arrayBuffer()
  const audioBase64 = Buffer.from(buffer).toString('base64')

  audioCache.set(cacheKey, audioBase64)

  return NextResponse.json({ audioBase64, cached: false })
}
