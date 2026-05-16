'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Award } from 'lucide-react'
import type { Employee, PropertyQuiz, Property } from '@/lib/types'
import { getCurrentUser, saveAttempt } from '@/lib/user'

interface Props {
  quiz: PropertyQuiz
  property: Property
}

type Phase = 'intro' | 'question' | 'result'

export function QuizClient({ quiz, property }: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [user, setUser] = useState<Employee | null>(null)
  const [savedForAttempt, setSavedForAttempt] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const total = quiz.questions.length
  const question = quiz.questions[current]
  const isLast = current === total - 1
  const pct = Math.round((score / total) * 100)
  const statusLabel =
    pct < 60 ? 'Keep studying — review the stories' : pct < 100 ? 'Almost ready' : 'Ready for service ✓'
  const certified = pct >= 60

  // Persist attempt exactly once when entering the result phase with a logged-in user.
  useEffect(() => {
    if (phase !== 'result' || savedForAttempt || !user) return
    saveAttempt({
      employeeEmail: user.email,
      propertyId: property.id,
      score,
      total,
      percent: pct,
    })
    setSavedForAttempt(true)
  }, [phase, savedForAttempt, user, property.id, score, total, pct])

  function handleAnswer(i: number) {
    if (selected !== null) return
    setSelected(i)
    if (i === question.correctIndex) setScore((s) => s + 1)
  }

  function handleNext() {
    if (isLast) {
      setPhase('result')
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  function restart() {
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setSavedForAttempt(false)
    setPhase('intro')
  }

  if (phase === 'intro') {
    return (
      <div className="px-4 pt-8 max-w-md mx-auto">
        <div className="flex items-center mb-10">
          <Link href="/" className="text-[#78716C] hover:text-[#1C1917] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-2">
            {property.restaurantName}
          </p>
          <h1 className="font-serif font-bold text-[#1C1917] text-2xl mb-3">{quiz.title}</h1>
          <p className="text-[#78716C] text-sm mb-10">{total} questions · ~3 minutes</p>
          <button
            onClick={() => setPhase('question')}
            className="w-full py-4 text-white font-semibold rounded-2xl transition-opacity text-sm active:opacity-90"
            style={{ backgroundColor: property.accentColor }}
          >
            Start →
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div className="px-4 pt-16 max-w-md mx-auto text-center">
        <p className="font-serif font-bold text-[#1C1917] text-4xl mb-2">
          {score}/{total}
        </p>
        <p className={`text-base font-semibold mb-6 ${
          pct === 100 ? 'text-emerald-700' : pct >= 60 ? 'text-amber-700' : 'text-[#78716C]'
        }`}>
          {statusLabel}
        </p>

        {user ? (
          <div className="mb-8 mx-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E7E0D8] bg-white">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.avatarInitials}
            </div>
            <span className="text-[11px] text-[#78716C]">
              {certified ? (
                <>
                  <Award className="inline w-3 h-3 -mt-0.5 mr-0.5 text-amber-600" />
                  Saved as certification for {user.name.split(' ')[0]}
                </>
              ) : (
                <>Saved to {user.name.split(' ')[0]}&apos;s history</>
              )}
            </span>
          </div>
        ) : (
          <div className="mb-8 mx-auto inline-block px-3 py-2 rounded-xl bg-stone-50 border border-[#E7E0D8]">
            <p className="text-[11px] text-[#78716C]">
              Sign in from the home screen to save this as a certification.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={restart}
            className="w-full py-3 border-2 font-semibold rounded-2xl transition-opacity text-sm active:opacity-80"
            style={{ borderColor: property.accentColor, color: property.accentColor }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="block w-full py-3 text-white font-semibold rounded-2xl transition-opacity text-sm text-center active:opacity-90"
            style={{ backgroundColor: property.accentColor }}
          >
            Back to stories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 max-w-md mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-[#78716C] hover:text-[#1C1917] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 bg-[#E7E0D8] rounded-full h-1">
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / total) * 100}%`, backgroundColor: property.accentColor }}
          />
        </div>
        <span className="text-[#78716C] text-xs tabular-nums">{current + 1}/{total}</span>
      </div>

      {/* Question */}
      <h2 className="font-serif font-bold text-[#1C1917] text-lg leading-snug mb-6">
        {question.question}
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctIndex
          const isChosen = i === selected
          let cls = 'border-[#E7E0D8] bg-white text-[#1C1917] hover:border-stone-400 cursor-pointer'
          if (selected !== null) {
            if (isCorrect) cls = 'border-emerald-200 bg-emerald-50/60 text-emerald-800 cursor-default'
            else if (isChosen) cls = 'border-[#E7E0D8] bg-stone-50 text-[#78716C] line-through cursor-default'
            else cls = 'border-[#E7E0D8] bg-white/50 text-[#A8A09A] cursor-default'
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center justify-between gap-2 ${cls}`}
            >
              <span>{opt}</span>
              {selected !== null && isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              )}
              {selected !== null && isChosen && !isCorrect && (
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {/* Explanation + next */}
      {selected !== null && (
        <div className="space-y-4">
          <div className="border border-[#E7E0D8] rounded-xl p-4 bg-[#FAF7F2]">
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 text-[#78716C]">
              {selected === question.correctIndex ? '✓ Correct' : 'Not quite'}
            </p>
            <p className="text-[#78716C] text-sm leading-relaxed">{question.explanation}</p>
          </div>
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-[#1C1917] hover:bg-stone-800 text-white font-semibold rounded-2xl transition-colors text-sm"
          >
            {isLast ? 'See results' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
}
