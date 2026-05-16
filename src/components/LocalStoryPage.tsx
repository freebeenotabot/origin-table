'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { getLocalStory } from '@/lib/clientStore'
import { properties } from '@/lib/data'
import type { StoryCard } from '@/lib/types'
import TagChip from '@/components/TagChip'
import LayeredContent from '@/components/LayeredContent'
import PronounceButton from '@/components/PronounceButton'

export default function LocalStoryPage({ id }: { id: string }) {
  const [card, setCard] = useState<StoryCard | null | undefined>(undefined)

  useEffect(() => {
    setCard(getLocalStory(id) ?? null)
  }, [id])

  if (card === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 rounded-full border-2 border-[#E7E0D8] border-t-[#78716C] animate-spin" />
      </div>
    )
  }

  if (card === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <p className="text-[#1C1917] font-serif text-xl font-bold mb-2">Story not found</p>
        <p className="text-[#78716C] text-sm mb-6">This card may have expired from the session.</p>
        <Link href="/" className="text-sm font-medium text-[#78716C] underline">← Back to library</Link>
      </div>
    )
  }

  const property = properties.find((p) => p.id === card.propertyId)
  const accentColor = property?.accentColor ?? '#B5451B'

  return (
    <main className="pb-16">
      <div className="relative h-64">
        <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/20 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-[#1C1917] text-sm font-medium px-3 py-2 rounded-full shadow-sm"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          {property && (
            <span
              className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-2 rounded-full shadow-sm"
              style={{ color: accentColor }}
            >
              {property.restaurantName}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-5">
        <div>
          <h1 className="font-serif font-bold text-[#1C1917] text-2xl leading-tight mb-2">{card.title}</h1>
          {card.seasonalPeriod && (
            <div
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide rounded-full px-3 py-1 mb-2"
              style={{ color: accentColor, backgroundColor: `${accentColor}15` }}
            >
              <CalendarDays size={11} />
              {card.seasonalPeriod === 'Year-round' ? 'Year-round' : `In season: ${card.seasonalPeriod}`}
            </div>
          )}
          <p className="text-[#78716C] text-sm leading-relaxed">{card.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>

        {card.pronounceTargets.length > 0 && (
          <div className="bg-white border border-[#E7E0D8] rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: accentColor }}>
              Say it right
            </p>
            <div className="flex flex-col gap-3">
              {card.pronounceTargets.map((target) => (
                <PronounceButton key={target.term} target={target} accentColor={accentColor} size="md" />
              ))}
            </div>
          </div>
        )}

        <LayeredContent layers={card.layers} accentColor={accentColor} />

        <Link
          href={`/quiz/${card.propertyId}`}
          className="flex items-center justify-center py-3.5 rounded-2xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: accentColor }}
        >
          Test yourself on {property?.restaurantName ?? 'this property'} →
        </Link>
      </div>
    </main>
  )
}
