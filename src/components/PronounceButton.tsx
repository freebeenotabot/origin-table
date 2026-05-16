'use client'

import { useState } from 'react'
import { Volume2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import type { PronounceTarget } from '@/lib/types'

// Module-level cache so audio survives re-renders without re-fetching
const audioCache = new Map<string, string>()

interface Props {
  target: PronounceTarget
  accentColor: string
  size?: 'sm' | 'md'
}

type State = 'idle' | 'loading' | 'played' | 'error'

export default function PronounceButton({ target, accentColor, size = 'md' }: Props) {
  const [state, setState] = useState<State>('idle')

  async function handlePlay() {
    if (state === 'loading') return

    const cacheKey = `${target.term}:${target.language}`
    const cached = audioCache.get(cacheKey)

    if (cached) {
      playAudio(cached)
      setState('played')
      return
    }

    setState('loading')
    try {
      const res = await fetch('/api/pronounce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: target.term, language: target.language }),
      })
      if (!res.ok) throw new Error('API error')
      const { audioBase64 } = await res.json()
      audioCache.set(cacheKey, audioBase64)
      playAudio(audioBase64)
      setState('played')
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  function playAudio(base64: string) {
    const audio = new Audio(`data:audio/mpeg;base64,${base64}`)
    audio.play().catch(() => {})
  }

  const isSm = size === 'sm'
  const height = isSm ? 'h-9' : 'h-11'
  const textSize = isSm ? 'text-xs' : 'text-sm'
  const iconSize = isSm ? 14 : 16

  const colorStyle =
    state === 'played'
      ? { color: '#16a34a', borderColor: '#16a34a' }
      : state === 'error'
      ? { color: '#dc2626', borderColor: '#dc2626' }
      : { color: accentColor, borderColor: accentColor }

  return (
    <button
      onClick={handlePlay}
      disabled={state === 'loading'}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 ${height} ${textSize} font-medium transition-all active:scale-95 disabled:opacity-60`}
      style={colorStyle}
    >
      {state === 'loading' && <Loader2 size={iconSize} className="animate-spin" />}
      {state === 'played' && <CheckCircle2 size={iconSize} />}
      {state === 'error' && <AlertCircle size={iconSize} />}
      {state === 'idle' && <Volume2 size={iconSize} />}
      <span>
        {target.term}
        {target.phonetic && (
          <span className="ml-1 opacity-60 font-normal">({target.phonetic})</span>
        )}
      </span>
    </button>
  )
}
