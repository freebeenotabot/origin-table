'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PenLine, Plus, Trophy } from 'lucide-react'
import type { Property, StoryCard as StoryCardType, PropertyId } from '@/lib/types'
import PropertyNav from '@/components/PropertyNav'
import StoryCard from '@/components/StoryCard'
import UserBadge from '@/components/UserBadge'

interface Props {
  properties: Property[]
  allStories: StoryCardType[]
}

export default function HomeClient({ properties, allStories }: Props) {
  const [activeId, setActiveId] = useState<PropertyId>('miramar')
  const active = properties.find((p) => p.id === activeId)!
  const cards = allStories.filter((s) => s.propertyId === activeId)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#E7E0D8]">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-serif text-[18px] font-bold tracking-wide text-[#1C1917]">
            Origin Table
          </h1>
          <div className="flex items-center gap-1">
            <Link
              href="/create"
              className="flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-opacity active:opacity-70 text-[#78716C]"
            >
              <Plus size={15} />
              <span>Create</span>
            </Link>
            <Link
              href="/leaderboard"
              aria-label="Leaderboard"
              className="p-2 text-[#78716C] active:opacity-70 transition-opacity"
            >
              <Trophy size={16} />
            </Link>
            <Link
              href={`/quiz/${activeId}`}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-opacity active:opacity-70"
              style={{ color: active.accentColor }}
            >
              <PenLine size={15} />
              <span>Quiz</span>
            </Link>
            <UserBadge />
          </div>
        </div>
        <PropertyNav
          properties={properties}
          activeId={activeId}
          onSelect={(id) => setActiveId(id as PropertyId)}
        />
      </header>

      {/* Property hero image */}
      <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden h-[180px] shadow-sm flex-shrink-0">
        <img
          src={active.heroImageUrl}
          alt={active.propertyFullName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <p className="text-white text-[10px] font-semibold uppercase tracking-widest opacity-75 mb-0.5">
            {active.location}
          </p>
          <h2 className="text-white font-serif text-[22px] font-bold leading-tight">
            {active.restaurantName}
          </h2>
        </div>
      </div>

      {/* Philosophy quote */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[12px] text-[#78716C] leading-snug italic">
          &ldquo;{active.philosophy}&rdquo;
        </p>
        <p className="text-[11px] text-[#78716C] mt-0.5">— {active.chefName}</p>
      </div>

      {/* Story grid */}
      <div className="px-4 pt-2 pb-4 grid grid-cols-2 gap-3 flex-1">
        {cards.map((card) => (
          <StoryCard key={card.id} story={card} accentColor={active.accentColor} />
        ))}
      </div>

      {/* Sticky quiz footer */}
      <div className="sticky bottom-0 px-4 py-3 bg-[#FAF7F2] border-t border-[#E7E0D8]">
        <Link
          href={`/quiz/${activeId}`}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white w-full shadow-sm active:opacity-90 transition-opacity"
          style={{ backgroundColor: active.accentColor }}
        >
          <PenLine size={16} />
          Start {active.restaurantName} Quiz
        </Link>
      </div>
    </div>
  )
}
