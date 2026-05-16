import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })

  const scribeForm = new FormData()
  scribeForm.append('file', file, 'recording.webm')
  scribeForm.append('model_id', 'scribe_v1')

  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: scribeForm,
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Scribe error:', res.status, err)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 502 })
  }

  const data = await res.json() as { text: string }
  return NextResponse.json({ text: data.text })
}
