'use client'

import { useState, useRef, useEffect, ChangeEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Mic, PenLine, Loader2, X, CheckCircle2, Check } from 'lucide-react'
import type { Property, StoryCard, PropertyId } from '@/lib/types'
import { saveLocalStory } from '@/lib/clientStore'
import TagChip from '@/components/TagChip'
import PronounceButton from '@/components/PronounceButton'

const ROLES = ['Chef', 'Pastry Chef', 'Resident Artist', 'Designer', 'Sommelier', 'Mixologist']

const VOICE_PROMPTS = [
  'What makes this creation special?',
  'Where did the inspiration come from?',
  'Any interesting sourcing — local farms, special suppliers?',
  'What technique or ritual is involved?',
  "What's one thing every guest should know?",
]

const WAVE_HEIGHTS = [10, 20, 14, 22, 12, 18, 8]

function ProgressBar({
  pct,
  back,
  accentColor,
}: {
  pct: number
  back: () => void
  accentColor: string
}) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <button onClick={back} className="text-[#78716C]">
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="flex-1 bg-[#E7E0D8] rounded-full h-1">
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: accentColor }}
        />
      </div>
    </div>
  )
}

type Phase = 'setup' | 'input' | 'loading-questions' | 'qa' | 'synthesizing' | 'preview' | 'published'
type InputMode = null | 'camera' | 'voice' | 'text'
type VoiceStep = 'idle' | 'recording' | 'processing' | 'done' | 'error'

interface Props {
  properties: Property[]
}

export function CreatorStudio({ properties }: Props) {
  // ── Setup state ──────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('setup')
  const [inputMode, setInputMode] = useState<InputMode>(null)
  const [role, setRole] = useState('')
  const [propertyId, setPropertyId] = useState<PropertyId | ''>('')
  const [creationTitle, setCreationTitle] = useState('')

  // ── Input content ────────────────────────────────────────────────────────────
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [braindump, setBraindump] = useState('')

  // ── Voice recording ──────────────────────────────────────────────────────────
  const [voiceStep, setVoiceStep] = useState<VoiceStep>('idle')
  const [voicePromptIndex, setVoicePromptIndex] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // ── Q&A ──────────────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<string[]>([])
  const [qaIndex, setQaIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')

  // ── Generated card ───────────────────────────────────────────────────────────
  const [generatedCard, setGeneratedCard] = useState<StoryCard | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSubtitle, setEditSubtitle] = useState('')
  const [editHeadline, setEditHeadline] = useState('')
  const [publishedId, setPublishedId] = useState<string | null>(null)

  const cameraInputRef = useRef<HTMLInputElement | null>(null)

  const activeProperty = properties.find((p) => p.id === propertyId)
  const accentColor = activeProperty?.accentColor ?? '#1C1917'

  // Cycle voice prompts while recording
  useEffect(() => {
    if (voiceStep !== 'recording') { setVoicePromptIndex(0); return }
    const id = setInterval(() => setVoicePromptIndex((i) => (i + 1) % VOICE_PROMPTS.length), 4000)
    return () => clearInterval(id)
  }, [voiceStep])

  // ── Camera ───────────────────────────────────────────────────────────────────

  function openCamera() {
    setTimeout(() => cameraInputRef.current?.click(), 50)
  }

  function handleCameraCapture(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageDataUrl(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ── Voice recording ──────────────────────────────────────────────────────────

  function startRecording(onText: (t: string) => void) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(
        (t) => MediaRecorder.isTypeSupported(t)
      ) ?? ''
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const actualType = mr.mimeType || mimeType || 'audio/webm'
        const ext = actualType.includes('mp4') ? 'm4a' : 'webm'
        const blob = new Blob(chunksRef.current, { type: actualType })
        setVoiceStep('processing')
        try {
          const fd = new FormData()
          fd.append('file', blob, `recording.${ext}`)
          const res = await fetch('/api/create/transcribe', { method: 'POST', body: fd })
          const data = await res.json()
          if (data.text) {
            onText(data.text)
            setVoiceStep('done')
          } else {
            setVoiceStep('error')
          }
        } catch {
          setVoiceStep('error')
        }
      }
      mr.start()
      setVoiceStep('recording')
      mediaRecorderRef.current = mr
    }).catch(() => {
      setVoiceStep('error')
    })
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    // voiceStep transitions to 'processing' inside mr.onstop
  }

  // ── Phase transitions ────────────────────────────────────────────────────────

  function handleSetupNext() {
    if (!role || !propertyId || !creationTitle.trim()) return
    setPhase('input')
    setInputMode(null)
  }

  async function handleInputNext() {
    const bd =
      voiceTranscript ||
      textInput ||
      (imageDataUrl ? `Creator shared a photo of their ${creationTitle}` : '')
    setBraindump(bd)
    await startQuestionFlow(bd)
  }

  async function startQuestionFlow(bd: string) {
    setPhase('loading-questions')
    try {
      const res = await fetch('/api/create/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, propertyId, creationTitle, braindump: bd }),
      })
      const data = await res.json()
      const qs: string[] = (data.questions ?? []).slice(0, 3)
      if (qs.length > 0) {
        setQuestions(qs)
        setQaIndex(0)
        setAnswers([])
        setCurrentAnswer('')
        setPhase('qa')
      } else {
        setPhase('synthesizing')
        await doSynthesize(bd, [])
      }
    } catch {
      setPhase('synthesizing')
      await doSynthesize(bd, [])
    }
  }

  async function handleQaNext(skip = false) {
    const answer = skip ? '' : currentAnswer
    const allAnswers = [...answers, answer]
    setAnswers(allAnswers)
    setCurrentAnswer('')
    if (qaIndex + 1 >= questions.length) {
      setPhase('synthesizing')
      await doSynthesize(braindump, allAnswers)
    } else {
      setQaIndex((i) => i + 1)
    }
  }

  function handleQaBack() {
    setCurrentAnswer('')
    if (qaIndex > 0) setQaIndex((i) => i - 1)
    else setPhase('input')
  }

  async function doSynthesize(bd: string, allAnswers: string[]) {
    const transcript = [
      `[Creator: ${role}]`,
      `Creation: ${creationTitle}`,
      '',
      'What the creator shared:',
      bd || '(no additional context)',
      '',
      ...(questions.length > 0
        ? ['Q&A Session:', ...questions.map((q, i) => `Q: ${q}\nA: ${allAnswers[i] || '(skipped)'}`)]
        : []),
    ]
      .filter(Boolean)
      .join('\n')

    const res = await fetch('/api/create/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, propertyId, creationTitle, transcript, imageDataUrl }),
    })
    const data = await res.json()
    const card = data.card as StoryCard
    setGeneratedCard(card)
    setEditTitle(card.title)
    setEditSubtitle(card.subtitle)
    setEditHeadline(card.layers.headline)
    setPhase('preview')
  }

  async function handlePublish() {
    if (!generatedCard) return
    const finalCard: StoryCard = {
      ...generatedCard,
      title: editTitle || generatedCard.title,
      subtitle: editSubtitle || generatedCard.subtitle,
      layers: { ...generatedCard.layers, headline: editHeadline || generatedCard.layers.headline },
    }
    const res = await fetch('/api/create/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card: finalCard }),
    })
    const data = await res.json()
    saveLocalStory(finalCard)
    setPublishedId(data.id)
    setPhase('published')
  }

  function restart() {
    setPhase('setup')
    setInputMode(null)
    setRole('')
    setPropertyId('')
    setCreationTitle('')
    setImageDataUrl(null)
    setTextInput('')
    setVoiceTranscript('')
    setVoiceStep('idle')
    setBraindump('')
    setQuestions([])
    setQaIndex(0)
    setAnswers([])
    setCurrentAnswer('')
    setGeneratedCard(null)
    setPublishedId(null)
  }

  // Hidden camera input — always in DOM so ref is valid across phase changes
  const cameraInput = (
    <input
      ref={cameraInputRef}
      type="file"
      accept="image/*"
      capture="environment"
      className="sr-only"
      onChange={handleCameraCapture}
    />
  )

  // ── SETUP ────────────────────────────────────────────────────────────────────

  if (phase === 'setup') {
    return (
      <div className="px-4 pt-8 max-w-md mx-auto pb-16">
        {cameraInput}
        <div className="flex items-center mb-8">
          <Link href="/" className="text-[#78716C] hover:text-[#1C1917] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-2">
          Creator Studio
        </p>
        <h1 className="font-serif font-bold text-[#1C1917] text-2xl mb-1">Add a Story</h1>
        <p className="text-[#78716C] text-sm mb-8">Any format, rough is fine.</p>

        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716C] mb-3">
            Your role
          </p>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                style={
                  role === r
                    ? { backgroundColor: accentColor, color: '#fff', borderColor: accentColor }
                    : { backgroundColor: '#fff', color: '#78716C', borderColor: '#E7E0D8' }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716C] mb-3">
            Property
          </p>
          <div className="flex flex-col gap-2">
            {properties.map((p) => (
              <button
                key={p.id}
                onClick={() => setPropertyId(p.id)}
                className="p-3 rounded-xl border text-left text-sm font-medium transition-all"
                style={
                  propertyId === p.id
                    ? {
                        borderColor: p.accentColor,
                        borderWidth: 2,
                        color: p.accentColor,
                        backgroundColor: `${p.accentColor}10`,
                      }
                    : { backgroundColor: '#fff', color: '#78716C', borderColor: '#E7E0D8' }
                }
              >
                <span className="font-semibold">{p.restaurantName}</span>
                <span className="ml-2 text-[#78716C] text-xs font-normal">{p.location}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716C] mb-3">
            Name your creation
          </p>
          <input
            type="text"
            value={creationTitle}
            onChange={(e) => setCreationTitle(e.target.value)}
            placeholder="e.g. Yuzu Kosho Sea Bass, The Monstera Painting..."
            className="w-full px-4 py-3 rounded-xl border border-[#E7E0D8] text-[#1C1917] text-sm bg-white placeholder-[#A8A09A] focus:outline-none focus:border-stone-400"
          />
        </div>

        <button
          onClick={handleSetupNext}
          disabled={!role || !propertyId || !creationTitle.trim()}
          className="w-full py-4 text-white font-semibold rounded-2xl text-sm disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: accentColor }}
        >
          Next →
        </button>
      </div>
    )
  }

  // ── INPUT — mode selection ───────────────────────────────────────────────────

  if (phase === 'input' && inputMode === null) {
    return (
      <div className="px-4 pt-8 max-w-md mx-auto pb-16">
        {cameraInput}
        <ProgressBar pct={20} back={() => setPhase('setup')} accentColor={accentColor} />

        <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-1">
          {creationTitle}
        </p>
        <h2 className="font-serif font-bold text-[#1C1917] text-xl mb-2">
          How do you want to share?
        </h2>
        <p className="text-[#78716C] text-sm mb-7">Pick whichever feels natural.</p>

        <div className="space-y-3">
          {/* Camera */}
          <button
            onClick={() => { setInputMode('camera'); openCamera() }}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#E7E0D8] text-left active:scale-[0.98] transition-transform shadow-sm"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accentColor}18` }}
            >
              <Camera size={22} style={{ color: accentColor }} />
            </div>
            <div>
              <p className="font-semibold text-[#1C1917] text-[15px]">Snap a Photo</p>
              <p className="text-[#78716C] text-xs mt-0.5">Take a photo of your creation</p>
            </div>
          </button>

          {/* Voice */}
          <button
            onClick={() => setInputMode('voice')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#E7E0D8] text-left active:scale-[0.98] transition-transform shadow-sm"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accentColor}18` }}
            >
              <Mic size={22} style={{ color: accentColor }} />
            </div>
            <div>
              <p className="font-semibold text-[#1C1917] text-[15px]">Voice Memo</p>
              <p className="text-[#78716C] text-xs mt-0.5">Talk us through it — we'll prompt you</p>
            </div>
          </button>

          {/* Text */}
          <button
            onClick={() => setInputMode('text')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#E7E0D8] text-left active:scale-[0.98] transition-transform shadow-sm"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accentColor}18` }}
            >
              <PenLine size={22} style={{ color: accentColor }} />
            </div>
            <div>
              <p className="font-semibold text-[#1C1917] text-[15px]">Write</p>
              <p className="text-[#78716C] text-xs mt-0.5">Type a description</p>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // ── INPUT — camera ───────────────────────────────────────────────────────────

  if (phase === 'input' && inputMode === 'camera') {
    return (
      <div className="px-4 pt-8 max-w-md mx-auto pb-16">
        {cameraInput}
        <ProgressBar pct={40} back={() => { setInputMode(null); setImageDataUrl(null) }} accentColor={accentColor} />

        {imageDataUrl ? (
          <>
            <div className="relative rounded-2xl overflow-hidden shadow-sm mb-5">
              <img src={imageDataUrl} alt="Your creation" className="w-full object-cover max-h-80" />
              <button
                onClick={() => { setImageDataUrl(null); openCamera() }}
                className="absolute top-3 right-3 bg-white/80 rounded-full p-2 shadow-sm"
              >
                <X size={14} className="text-[#78716C]" />
              </button>
            </div>
            <p className="font-serif font-bold text-[#1C1917] text-lg mb-1">Looking good!</p>
            <p className="text-[#78716C] text-sm mb-6">
              We&apos;ll use this to help build your training card.
            </p>
            <button
              onClick={handleInputNext}
              className="w-full py-4 text-white font-semibold rounded-2xl text-sm transition-opacity active:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              Next →
            </button>
          </>
        ) : (
          <div className="text-center pt-20">
            <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-5">
              <Camera size={32} className="text-[#78716C]" />
            </div>
            <p className="text-[#78716C] text-sm mb-6">Camera should be opening...</p>
            <button
              onClick={openCamera}
              className="px-6 py-3 rounded-xl border border-[#E7E0D8] text-sm text-[#78716C] bg-white"
            >
              Open camera
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── INPUT — voice ────────────────────────────────────────────────────────────

  if (phase === 'input' && inputMode === 'voice') {
    // ── idle: large centered mic, single CTA ──────────────────────────────────
    if (voiceStep === 'idle') {
      return (
        <div className="px-4 pt-8 max-w-md mx-auto pb-16">
          {cameraInput}
          <ProgressBar pct={40} back={() => { setInputMode(null); setVoiceStep('idle') }} accentColor={accentColor} />

          <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-1">
            {creationTitle}
          </p>
          <h2 className="font-serif font-bold text-[#1C1917] text-xl mb-10">Voice Memo</h2>

          <div className="text-center">
            <button
              onClick={() => startRecording(setVoiceTranscript)}
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg transition-transform active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              <Mic size={36} className="text-white" />
            </button>
            <p className="font-medium text-[#1C1917] text-sm mt-5">Tap to start recording</p>
            <p className="text-[#78716C] text-xs mt-1">Talk naturally — we&apos;ll guide you with prompts</p>
          </div>
        </div>
      )
    }

    // ── recording: cycling prompt card + red stop button + wave ───────────────
    if (voiceStep === 'recording') {
      return (
        <div className="px-4 pt-8 max-w-md mx-auto pb-16">
          {cameraInput}
          <ProgressBar pct={40} back={() => { stopRecording(); setVoiceStep('idle') }} accentColor={accentColor} />

          <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-1">
            {creationTitle}
          </p>
          <h2 className="font-serif font-bold text-[#1C1917] text-xl mb-6">Voice Memo</h2>

          <div className="bg-stone-50 border border-[#E7E0D8] rounded-2xl p-5 mb-8 min-h-[80px] flex items-center justify-center">
            <p className="font-serif italic text-[#1C1917] text-[15px] leading-snug text-center">
              &ldquo;{VOICE_PROMPTS[voicePromptIndex]}&rdquo;
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={stopRecording}
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg transition-transform active:scale-95"
              style={{ backgroundColor: '#ef4444' }}
            >
              <div className="w-8 h-8 rounded bg-white" />
            </button>
            <p className="text-[#78716C] text-xs mt-4">Tap to stop</p>

            <div className="mt-5 flex justify-center items-end gap-1">
              {WAVE_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-red-400 animate-pulse"
                  style={{ height: `${h}px`, animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )
    }

    // ── processing: spinner only, no other UI ─────────────────────────────────
    if (voiceStep === 'processing') {
      return (
        <div className="px-4 pt-8 max-w-md mx-auto pb-16">
          {cameraInput}
          <ProgressBar pct={40} back={() => {}} accentColor={accentColor} />

          <div className="flex flex-col items-center justify-center pt-24 gap-4">
            <Loader2 size={32} className="animate-spin text-[#78716C]" />
            <p className="text-[#78716C] text-sm">Converting your voice…</p>
          </div>
        </div>
      )
    }

    // ── done: success line + editable textarea + sticky Next button ───────────
    if (voiceStep === 'done') {
      return (
        <div className="px-4 pt-8 max-w-md mx-auto pb-28">
          {cameraInput}
          <ProgressBar pct={40} back={() => { setVoiceStep('idle'); setVoiceTranscript('') }} accentColor={accentColor} />

          <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-1">
            {creationTitle}
          </p>
          <h2 className="font-serif font-bold text-[#1C1917] text-xl mb-4">Voice Memo</h2>

          {/* Success confirmation line */}
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium mb-4">
            <Check size={15} />
            <span>Got it!</span>
          </div>

          {/* Compact editable transcript */}
          <div className="bg-stone-50 border border-[#E7E0D8] rounded-xl p-4 mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716C] mb-2">
              Your recording
            </p>
            <textarea
              value={voiceTranscript}
              onChange={(e) => setVoiceTranscript(e.target.value)}
              rows={3}
              className="w-full text-sm text-[#1C1917] bg-transparent focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Record again — very small secondary link */}
          <button
            onClick={() => { setVoiceTranscript(''); setVoiceStep('idle') }}
            className="text-xs text-[#78716C] underline underline-offset-2 mb-5"
          >
            Record again
          </button>

          {/* Add a photo — small camera icon link, above sticky bar */}
          {imageDataUrl ? (
            <div className="relative rounded-xl overflow-hidden h-28 mb-5 shadow-sm">
              <img src={imageDataUrl} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setImageDataUrl(null)}
                className="absolute top-2 right-2 bg-white/80 rounded-full p-1"
              >
                <X size={12} className="text-[#78716C]" />
              </button>
            </div>
          ) : (
            <button
              onClick={openCamera}
              className="flex items-center gap-1.5 text-xs text-[#78716C] mb-5"
            >
              <Camera size={13} />
              Add a photo too
            </button>
          )}

          {/* Sticky bottom bar — always visible */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 py-3 bg-[#FAF7F2] border-t border-[#E7E0D8]">
            <button
              onClick={handleInputNext}
              className="w-full py-4 text-white font-semibold rounded-2xl text-sm transition-opacity active:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              Next →
            </button>
          </div>
        </div>
      )
    }

    // ── error: message + Try again / Type instead ─────────────────────────────
    if (voiceStep === 'error') {
      return (
        <div className="px-4 pt-8 max-w-md mx-auto pb-16">
          {cameraInput}
          <ProgressBar pct={40} back={() => { setInputMode(null); setVoiceStep('idle') }} accentColor={accentColor} />

          <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-1">
            {creationTitle}
          </p>
          <h2 className="font-serif font-bold text-[#1C1917] text-xl mb-6">Voice Memo</h2>

          <div className="text-center pt-10">
            <p className="text-[#1C1917] text-sm font-medium mb-2">
              Couldn&apos;t transcribe — check your microphone or try again
            </p>
            <div className="flex flex-col gap-3 mt-8 max-w-xs mx-auto">
              <button
                onClick={() => { setVoiceStep('idle') }}
                className="w-full py-4 text-white font-semibold rounded-2xl text-sm transition-opacity active:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                Try again
              </button>
              <button
                onClick={() => { setInputMode('text'); setVoiceStep('idle') }}
                className="w-full py-3 text-[#78716C] text-sm border border-[#E7E0D8] rounded-xl bg-white"
              >
                Type instead
              </button>
            </div>
          </div>
        </div>
      )
    }

    // fallback (should never render)
    return null
  }

  // ── INPUT — text ─────────────────────────────────────────────────────────────

  if (phase === 'input' && inputMode === 'text') {
    return (
      <div className="px-4 pt-8 max-w-md mx-auto pb-16">
        {cameraInput}
        <ProgressBar pct={40} back={() => setInputMode(null)} accentColor={accentColor} />

        <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-1">
          {creationTitle}
        </p>
        <h2 className="font-serif font-bold text-[#1C1917] text-xl mb-2">Tell us about it</h2>
        <p className="text-[#78716C] text-sm mb-5">
          Rough notes, memories, anything — we&apos;ll shape it into a story.
        </p>

        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          autoFocus
          placeholder="What makes this special? How did it come about? Any interesting ingredients, technique, or story?"
          className="w-full h-44 px-4 py-3 rounded-xl border border-[#E7E0D8] text-[#1C1917] text-sm bg-white placeholder-[#A8A09A] focus:outline-none focus:border-stone-400 resize-none mb-4"
        />

        {imageDataUrl ? (
          <div className="relative rounded-xl overflow-hidden h-28 mb-5 shadow-sm">
            <img src={imageDataUrl} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => setImageDataUrl(null)}
              className="absolute top-2 right-2 bg-white/80 rounded-full p-1"
            >
              <X size={12} className="text-[#78716C]" />
            </button>
          </div>
        ) : (
          <button onClick={openCamera} className="flex items-center gap-2 text-sm text-[#78716C] mb-5">
            <Camera size={14} />
            Add a photo too
          </button>
        )}

        <button
          onClick={handleInputNext}
          disabled={!textInput.trim()}
          className="w-full py-4 text-white font-semibold rounded-2xl text-sm disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: accentColor }}
        >
          Next →
        </button>
      </div>
    )
  }

  // ── LOADING ──────────────────────────────────────────────────────────────────

  if (phase === 'loading-questions' || phase === 'synthesizing') {
    return (
      <div className="px-4 pt-40 max-w-md mx-auto text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#78716C] mx-auto mb-4" />
        <p className="text-[#78716C] text-sm">
          {phase === 'loading-questions' ? 'Finding the hidden stories...' : 'Crafting your training card...'}
        </p>
      </div>
    )
  }

  // ── Q&A ──────────────────────────────────────────────────────────────────────

  if (phase === 'qa') {
    return (
      <div className="px-4 pt-8 max-w-md mx-auto pb-16">
        {cameraInput}
        <ProgressBar pct={40 + ((qaIndex + 1) / questions.length) * 35} back={handleQaBack} accentColor={accentColor} />

        <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-4">
          Quick question {qaIndex + 1} of {questions.length}
        </p>
        <h2 className="font-serif font-bold text-[#1C1917] text-lg leading-snug mb-6">
          {questions[qaIndex]}
        </h2>

        <textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Share whatever comes to mind..."
          className="w-full h-32 px-4 py-3 rounded-xl border border-[#E7E0D8] text-[#1C1917] text-sm bg-white placeholder-[#A8A09A] focus:outline-none focus:border-stone-400 resize-none mb-4"
        />

        {voiceStep === 'processing' ? (
          <div className="flex items-center gap-2 text-[#78716C] text-sm mb-4">
            <Loader2 size={14} className="animate-spin" />
            <span>Transcribing...</span>
          </div>
        ) : voiceStep === 'recording' ? (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-400 text-sm text-red-600 bg-red-50 mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Stop recording
          </button>
        ) : (
          <button
            onClick={() => startRecording((t) => { setCurrentAnswer((a) => (a ? `${a} ${t}` : t)); setVoiceStep('idle') })}
            className="flex items-center gap-2 text-sm text-[#78716C] mb-4"
          >
            <Mic size={14} style={{ color: accentColor }} />
            Answer by voice
          </button>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => handleQaNext(true)}
            className="flex-1 py-3 text-[#78716C] text-sm border border-[#E7E0D8] rounded-xl bg-white"
          >
            Skip
          </button>
          <button
            onClick={() => handleQaNext(false)}
            className="flex-1 py-3 text-white font-semibold rounded-xl text-sm"
            style={{ backgroundColor: accentColor }}
          >
            {qaIndex + 1 === questions.length ? 'Done →' : 'Next →'}
          </button>
        </div>
      </div>
    )
  }

  // ── PREVIEW ──────────────────────────────────────────────────────────────────

  if (phase === 'preview' && generatedCard) {
    return (
      <div className="pb-24">
        {cameraInput}

        {/* Hero image — full bleed */}
        {generatedCard.imageUrl && (
          <div className="relative h-72">
            <img
              src={generatedCard.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/10 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <span
                className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm"
                style={{ color: accentColor }}
              >
                {activeProperty?.restaurantName}
              </span>
              <span className="bg-white/90 backdrop-blur-sm text-xs text-[#78716C] font-medium px-3 py-1.5 rounded-full shadow-sm">
                {role}
              </span>
            </div>
          </div>
        )}

        <div className="px-4 pt-4">
          {/* Editable title — styled as display text */}
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full font-serif font-bold text-[#1C1917] text-2xl bg-transparent outline-none pb-0.5 border-b-2 border-transparent focus:border-stone-200 transition-colors"
          />

          {/* Editable subtitle */}
          <textarea
            value={editSubtitle}
            onChange={(e) => setEditSubtitle(e.target.value)}
            rows={2}
            className="w-full text-[#78716C] text-sm bg-transparent outline-none resize-none mt-2 leading-relaxed border-b border-transparent focus:border-stone-200 transition-colors"
          />

          {/* Tags */}
          {generatedCard.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 mb-5">
              {generatedCard.tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </div>
          )}

          <div className="border-t border-[#E7E0D8] my-5" />

          {/* The Short Story — editable */}
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716C] mb-2">
              The Short Story
            </p>
            <textarea
              value={editHeadline}
              onChange={(e) => setEditHeadline(e.target.value)}
              rows={2}
              className="w-full font-serif italic text-[#1C1917] text-[15px] leading-snug bg-transparent outline-none resize-none"
            />
          </div>

          <div className="border-t border-[#E7E0D8] my-5" />

          {/* Go Deeper */}
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716C] mb-2">
              Go Deeper
            </p>
            <p className="text-sm text-[#78716C] leading-relaxed">{generatedCard.layers.story}</p>
          </div>

          {/* Name-Drop Details */}
          {generatedCard.layers.details.length > 0 && (
            <>
              <div className="border-t border-[#E7E0D8] my-5" />
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716C] mb-3">
                  Name-Drop Details
                </p>
                <ul className="space-y-2">
                  {generatedCard.layers.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#78716C]">
                      <span
                        className="font-bold mt-0.5 flex-shrink-0"
                        style={{ color: accentColor }}
                      >
                        ·
                      </span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Pronunciation */}
          {generatedCard.pronounceTargets?.length > 0 && (
            <>
              <div className="border-t border-[#E7E0D8] my-5" />
              <div className="mb-5">
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                  style={{ color: accentColor }}
                >
                  Say it right
                </p>
                <div className="flex flex-col gap-3">
                  {generatedCard.pronounceTargets.map((target) => (
                    <PronounceButton
                      key={target.term}
                      target={target}
                      accentColor={accentColor}
                      size="md"
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="border-t border-[#E7E0D8] my-5" />

          <button
            onClick={handlePublish}
            className="w-full py-4 text-white font-semibold rounded-2xl text-sm transition-opacity active:opacity-90 shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            Publish to Library →
          </button>
          <p className="text-center text-xs text-[#A8A09A] mt-3">
            Tap the title or headline above to edit before publishing
          </p>
        </div>
      </div>
    )
  }

  // ── PUBLISHED ────────────────────────────────────────────────────────────────

  if (phase === 'published') {
    return (
      <div className="pb-16">
        <div className="px-4 pt-14 max-w-md mx-auto text-center mb-7">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="font-serif font-bold text-[#1C1917] text-2xl mb-2">Now live!</h1>
          <p className="text-[#78716C] text-sm">
            Staff can now learn the story of{' '}
            <span className="font-semibold text-[#1C1917]">{editTitle || creationTitle}</span>.
          </p>
        </div>

        {/* Mini card */}
        {generatedCard && (
          <div className="mx-4 bg-white rounded-2xl border border-[#E7E0D8] overflow-hidden shadow-sm mb-7">
            {generatedCard.imageUrl && (
              <img
                src={generatedCard.imageUrl}
                alt=""
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                style={{ color: accentColor }}
              >
                {activeProperty?.restaurantName}
              </p>
              <h3 className="font-serif font-bold text-[#1C1917] text-[17px] leading-snug mb-1">
                {editTitle || generatedCard.title}
              </h3>
              <p className="text-[#78716C] text-xs line-clamp-2 leading-relaxed">
                {editSubtitle || generatedCard.subtitle}
              </p>
              {generatedCard.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {generatedCard.tags.slice(0, 3).map((tag) => (
                    <TagChip key={tag} tag={tag} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="px-4 space-y-3">
          {publishedId && (
            <Link
              href={`/stories/${publishedId}`}
              className="block w-full py-3.5 text-white font-semibold rounded-2xl text-sm text-center transition-opacity active:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              See the training card →
            </Link>
          )}
          <button
            onClick={restart}
            className="w-full py-3 border-2 font-semibold rounded-2xl text-sm transition-opacity active:opacity-80"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            Add another story
          </button>
          <Link href="/" className="block text-center text-[#78716C] text-sm pt-1">
            ← Back to library
          </Link>
        </div>
      </div>
    )
  }

  return null
}
