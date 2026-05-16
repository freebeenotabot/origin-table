'use client'

import { useState, useRef, ChangeEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mic, Loader2, Upload, X, CheckCircle2 } from 'lucide-react'
import type { Property, StoryCard, PropertyId } from '@/lib/types'
import TagChip from '@/components/TagChip'

const ROLES = ['Chef', 'Pastry Chef', 'Resident Artist', 'Designer', 'Sommelier', 'Mixologist']

type Phase =
  | 'setup'
  | 'braindump'
  | 'loading-questions'
  | 'qa'
  | 'synthesizing'
  | 'preview'
  | 'published'

interface Props {
  properties: Property[]
}

// ── VoiceButton ────────────────────────────────────────────────────────────────

function VoiceButton({
  recording,
  transcribing,
  onStart,
  onStop,
  accentColor,
}: {
  recording: boolean
  transcribing: boolean
  onStart: () => void
  onStop: () => void
  accentColor: string
}) {
  if (transcribing) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E7E0D8] text-sm text-[#78716C] bg-white">
        <Loader2 size={14} className="animate-spin" />
        <span>Transcribing...</span>
      </div>
    )
  }
  if (recording) {
    return (
      <button
        onClick={onStop}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-400 text-sm text-red-600 bg-red-50"
      >
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span>Stop</span>
      </button>
    )
  }
  return (
    <button
      onClick={onStart}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E7E0D8] text-sm text-[#78716C] bg-white hover:border-stone-400 transition-colors"
      style={{}}
    >
      <Mic size={14} style={{ color: accentColor }} />
      <span>Voice</span>
    </button>
  )
}

// ── CreatorStudio ──────────────────────────────────────────────────────────────

export function CreatorStudio({ properties }: Props) {
  const [phase, setPhase] = useState<Phase>('setup')

  // Setup state
  const [role, setRole] = useState('')
  const [propertyId, setPropertyId] = useState<PropertyId | ''>('')
  const [creationTitle, setCreationTitle] = useState('')

  // Braindump state
  const [braindump, setBraindump] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)

  // Q&A state
  const [questions, setQuestions] = useState<string[]>([])
  const [qaIndex, setQaIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')

  // Generated card state
  const [generatedCard, setGeneratedCard] = useState<StoryCard | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSubtitle, setEditSubtitle] = useState('')
  const [editHeadline, setEditHeadline] = useState('')

  const [publishedId, setPublishedId] = useState<string | null>(null)

  // Voice recording state
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const activeProperty = properties.find((p) => p.id === propertyId)
  const accentColor = activeProperty?.accentColor ?? '#1C1917'

  // ── Voice helpers ────────────────────────────────────────────────────────────

  function startRecording(onText: (text: string) => void) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mr = new MediaRecorder(stream)
        chunksRef.current = []
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }
        mr.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop())
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          setTranscribing(true)
          try {
            const fd = new FormData()
            fd.append('file', blob, 'recording.webm')
            const res = await fetch('/api/create/transcribe', { method: 'POST', body: fd })
            const data = await res.json()
            if (data.text) onText(data.text)
          } catch {}
          setTranscribing(false)
        }
        mr.start()
        setRecording(true)
        mediaRecorderRef.current = mr
      })
      .catch(() => {})
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  // ── Image upload ─────────────────────────────────────────────────────────────

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageDataUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  // ── Phase transitions ────────────────────────────────────────────────────────

  function handleSetupNext() {
    if (!role || !propertyId || !creationTitle.trim()) return
    setPhase('braindump')
  }

  async function handleBraindumpNext() {
    if (!braindump.trim()) return
    setPhase('loading-questions')
    try {
      const res = await fetch('/api/create/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, propertyId, creationTitle, braindump }),
      })
      const data = await res.json()
      const qs: string[] = data.questions ?? []
      if (qs.length > 0) {
        setQuestions(qs)
        setQaIndex(0)
        setAnswers([])
        setCurrentAnswer('')
        setPhase('qa')
      } else {
        setPhase('synthesizing')
        await doSynthesize([])
      }
    } catch {
      setPhase('synthesizing')
      await doSynthesize([])
    }
  }

  async function handleQaNext(skip = false) {
    const answer = skip ? '' : currentAnswer
    const allAnswers = [...answers, answer]
    setAnswers(allAnswers)
    setCurrentAnswer('')

    if (qaIndex + 1 >= questions.length) {
      setPhase('synthesizing')
      await doSynthesize(allAnswers)
    } else {
      setQaIndex((i) => i + 1)
    }
  }

  async function doSynthesize(allAnswers: string[]) {
    const transcript = [
      `[Creator: ${role}]`,
      `Creation: ${creationTitle}`,
      '',
      'What the creator shared:',
      braindump,
      '',
      questions.length > 0 ? 'Q&A Session:' : '',
      ...questions.map((q, i) => `Q: ${q}\nA: ${allAnswers[i] || '(skipped)'}`),
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
    setPublishedId(data.id)
    setPhase('published')
  }

  function restart() {
    setPhase('setup')
    setRole('')
    setPropertyId('')
    setCreationTitle('')
    setBraindump('')
    setImageDataUrl(null)
    setQuestions([])
    setQaIndex(0)
    setAnswers([])
    setCurrentAnswer('')
    setGeneratedCard(null)
    setPublishedId(null)
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (phase === 'setup') {
    return (
      <div className="px-4 pt-14 max-w-md mx-auto pb-12">
        <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-2">
          Creator Studio
        </p>
        <h1 className="font-serif font-bold text-[#1C1917] text-2xl mb-1">Add a Story</h1>
        <p className="text-[#78716C] text-sm mb-8">
          Share your creation — any format, rough is fine.
        </p>

        {/* Role chips */}
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

        {/* Property selector */}
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
                        backgroundColor: `${p.accentColor}12`,
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

        {/* Creation name */}
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
        <Link href="/" className="block mt-4 text-[#78716C] text-sm text-center">
          ← Back to stories
        </Link>
      </div>
    )
  }

  if (phase === 'braindump') {
    return (
      <div className="px-4 pt-8 max-w-md mx-auto pb-12">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setPhase('setup')} className="text-[#78716C]">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 bg-[#E7E0D8] rounded-full h-1">
            <div
              className="h-1 rounded-full transition-all"
              style={{ width: '25%', backgroundColor: accentColor }}
            />
          </div>
          <span className="text-[#78716C] text-xs">1 / 4</span>
        </div>

        <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-1">
          {creationTitle}
        </p>
        <h2 className="font-serif font-bold text-[#1C1917] text-xl mb-2">Tell us about it</h2>
        <p className="text-[#78716C] text-sm mb-5">
          Rough notes, memories, anything — we&apos;ll help shape it.
        </p>

        <textarea
          value={braindump}
          onChange={(e) => setBraindump(e.target.value)}
          placeholder="What makes this creation special? How did it come about? Any interesting ingredients, techniques, or stories behind it?"
          className="w-full h-36 px-4 py-3 rounded-xl border border-[#E7E0D8] text-[#1C1917] text-sm bg-white placeholder-[#A8A09A] focus:outline-none focus:border-stone-400 resize-none"
        />

        {/* Controls row */}
        <div className="flex gap-3 mt-3 mb-4">
          <VoiceButton
            recording={recording}
            transcribing={transcribing}
            onStart={() =>
              startRecording((text) => setBraindump((b) => (b ? `${b} ${text}` : text)))
            }
            onStop={stopRecording}
            accentColor={accentColor}
          />
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E7E0D8] text-sm text-[#78716C] bg-white cursor-pointer hover:border-stone-400 transition-colors">
            <Upload size={14} />
            <span>{imageDataUrl ? 'Change photo' : 'Add photo'}</span>
            <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
          </label>
        </div>

        {/* Image preview */}
        {imageDataUrl && (
          <div className="mb-4 relative">
            <img
              src={imageDataUrl}
              alt="Uploaded"
              className="w-full h-36 object-cover rounded-xl"
            />
            <button
              onClick={() => setImageDataUrl(null)}
              className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow-sm"
            >
              <X size={14} className="text-[#78716C]" />
            </button>
          </div>
        )}

        <button
          onClick={handleBraindumpNext}
          disabled={!braindump.trim()}
          className="w-full py-4 text-white font-semibold rounded-2xl text-sm disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: accentColor }}
        >
          Next →
        </button>
      </div>
    )
  }

  if (phase === 'loading-questions' || phase === 'synthesizing') {
    const msg =
      phase === 'loading-questions' ? 'Finding the hidden stories...' : 'Crafting your training card...'
    return (
      <div className="px-4 pt-40 max-w-md mx-auto text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#78716C] mx-auto mb-4" />
        <p className="text-[#78716C] text-sm">{msg}</p>
      </div>
    )
  }

  if (phase === 'qa') {
    const question = questions[qaIndex]
    return (
      <div className="px-4 pt-8 max-w-md mx-auto pb-12">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => {
              if (qaIndex > 0) setQaIndex((i) => i - 1)
              else setPhase('braindump')
            }}
            className="text-[#78716C]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 bg-[#E7E0D8] rounded-full h-1">
            <div
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: `${((qaIndex + 2) / (questions.length + 2)) * 100}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
          <span className="text-[#78716C] text-xs tabular-nums">
            {qaIndex + 1}/{questions.length}
          </span>
        </div>

        <h2 className="font-serif font-bold text-[#1C1917] text-lg leading-snug mb-6">
          {question}
        </h2>

        <textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Share whatever comes to mind..."
          className="w-full h-32 px-4 py-3 rounded-xl border border-[#E7E0D8] text-[#1C1917] text-sm bg-white placeholder-[#A8A09A] focus:outline-none focus:border-stone-400 resize-none mb-4"
        />

        <VoiceButton
          recording={recording}
          transcribing={transcribing}
          onStart={() =>
            startRecording((text) => setCurrentAnswer((a) => (a ? `${a} ${text}` : text)))
          }
          onStop={stopRecording}
          accentColor={accentColor}
        />

        <div className="flex gap-3 mt-4">
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

  if (phase === 'preview' && generatedCard) {
    return (
      <div className="px-4 pt-8 pb-20 max-w-md mx-auto">
        <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-1">
          Preview
        </p>
        <h2 className="font-serif font-bold text-[#1C1917] text-xl mb-6">Your training card</h2>

        {imageDataUrl && (
          <img
            src={imageDataUrl}
            alt=""
            className="w-full h-48 object-cover rounded-2xl mb-5 shadow-sm"
          />
        )}

        {/* Editable title */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716C] mb-1.5">
            Title
          </p>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E7E0D8] font-serif font-bold text-[#1C1917] text-lg bg-white focus:outline-none focus:border-stone-400"
          />
        </div>

        {/* Editable subtitle */}
        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716C] mb-1.5">
            Subtitle
          </p>
          <textarea
            value={editSubtitle}
            onChange={(e) => setEditSubtitle(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E7E0D8] text-[#78716C] text-sm bg-white focus:outline-none focus:border-stone-400 resize-none"
          />
        </div>

        {/* The short story (editable) */}
        <div className="bg-stone-50 border border-[#E7E0D8] rounded-xl p-4 mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716C] mb-2">
            The short story
          </p>
          <textarea
            value={editHeadline}
            onChange={(e) => setEditHeadline(e.target.value)}
            rows={2}
            className="w-full text-sm text-[#1C1917] bg-transparent focus:outline-none resize-none"
          />
        </div>

        {/* Story layer */}
        <div className="bg-stone-50 border border-[#E7E0D8] rounded-xl p-4 mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716C] mb-2">
            Go deeper
          </p>
          <p className="text-sm text-[#78716C] leading-relaxed">{generatedCard.layers.story}</p>
        </div>

        {/* Details */}
        {generatedCard.layers.details.length > 0 && (
          <div className="bg-stone-50 border border-[#E7E0D8] rounded-xl p-4 mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716C] mb-2">
              Name-drop details
            </p>
            <ul className="space-y-1">
              {generatedCard.layers.details.map((d, i) => (
                <li key={i} className="text-sm text-[#78716C]">
                  · {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {generatedCard.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {generatedCard.tags.map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
        )}

        <button
          onClick={handlePublish}
          className="w-full py-4 text-white font-semibold rounded-2xl text-sm transition-opacity active:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          Publish to Library →
        </button>
      </div>
    )
  }

  if (phase === 'published') {
    return (
      <div className="px-4 pt-16 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="font-serif font-bold text-[#1C1917] text-2xl mb-2">Live in the library!</h1>
        <p className="text-[#78716C] text-sm mb-8">
          Staff can now learn the story of {editTitle || creationTitle}.
        </p>

        <div className="space-y-3">
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
          <Link href="/" className="block mt-2 text-[#78716C] text-sm">
            ← Back to library
          </Link>
        </div>
      </div>
    )
  }

  return null
}
