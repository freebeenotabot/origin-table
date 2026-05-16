'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, BookOpen } from 'lucide-react'
import type { QuizQuestion } from '@/lib/types'

interface Props {
  questions: QuizQuestion[]
  propertyId: string
  accentColor: string
  title: string
}

export default function QuizMode({ questions, propertyId, accentColor, title }: Props) {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[current]
  const answered = selected !== null

  function handleSelect(idx: number) {
    if (answered) return
    setSelected(idx)
    if (idx === q.correctIndex) setScore((s) => s + 1)
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setDone(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  function handleReset() {
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setDone(false)
  }

  if (done) {
    const total = questions.length
    const pct = score / total
    const msg =
      pct === 1
        ? { text: 'Ready for service ✓', color: '#16a34a', bg: '#f0fdf4' }
        : pct >= 0.6
        ? { text: 'Almost ready', color: '#d97706', bg: '#fffbeb' }
        : { text: 'Keep studying', color: '#dc2626', bg: '#fef2f2' }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold font-serif"
          style={{ backgroundColor: msg.bg, color: msg.color }}
        >
          {score}/{total}
        </div>
        <div>
          <p className="text-2xl font-serif font-bold" style={{ color: msg.color }}>
            {msg.text}
          </p>
          <p className="text-[#78716C] mt-1 text-sm">
            {score} correct out of {total} questions
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-colors"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            <RotateCcw size={16} />
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            <BookOpen size={16} />
            Back to Stories
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pb-24">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-[#78716C] mb-1.5">
          <span>Question {current + 1} of {questions.length}</span>
          <span style={{ color: accentColor }}>{score} correct</span>
        </div>
        <div className="h-1.5 bg-[#E7E0D8] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((current) / questions.length) * 100}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0D8] p-5 mb-4">
        <p className="font-serif text-[18px] font-semibold leading-snug text-[#1C1917]">
          {q.question}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-4">
        {q.options.map((option, idx) => {
          const isCorrect = idx === q.correctIndex
          const isSelected = idx === selected

          let borderColor = '#E7E0D8'
          let bgColor = 'white'
          let textColor = '#1C1917'
          let icon = null

          if (answered) {
            if (isCorrect) {
              borderColor = '#16a34a'
              bgColor = '#f0fdf4'
              textColor = '#15803d'
              icon = <CheckCircle2 size={18} className="flex-shrink-0 text-green-600" />
            } else if (isSelected) {
              borderColor = '#dc2626'
              bgColor = '#fef2f2'
              textColor = '#dc2626'
              icon = <XCircle size={18} className="flex-shrink-0 text-red-600" />
            }
          } else if (isSelected) {
            borderColor = accentColor
            bgColor = '#fff'
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className="flex items-start gap-3 text-left p-4 rounded-xl border-2 min-h-[52px] transition-all active:scale-[0.99]"
              style={{ borderColor, backgroundColor: bgColor, color: textColor }}
            >
              <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                style={{ borderColor: answered && isCorrect ? '#16a34a' : answered && isSelected ? '#dc2626' : accentColor,
                         color: answered && isCorrect ? '#16a34a' : answered && isSelected ? '#dc2626' : accentColor }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-[14px] leading-snug flex-1">{option}</span>
              {icon}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div
          className="rounded-xl p-4 mb-4 border"
          style={{
            backgroundColor: selected === q.correctIndex ? '#f0fdf4' : '#fef2f2',
            borderColor: selected === q.correctIndex ? '#bbf7d0' : '#fecaca',
          }}
        >
          <p className="text-[13px] leading-relaxed text-[#44403C]">
            <span className="font-semibold">
              {selected === q.correctIndex ? '✓ Correct — ' : '✗ Not quite — '}
            </span>
            {q.explanation}
          </p>
        </div>
      )}

      {/* Next button */}
      {answered && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition-colors"
          style={{ backgroundColor: accentColor }}
        >
          {current + 1 >= questions.length ? 'See Results' : 'Next Question'}
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  )
}
