'use client'

import { useState } from 'react'
import { properties, getStoriesByProperty } from '@/lib/data'
import type { PropertyId } from '@/lib/types'
import PropertyNav from '@/components/PropertyNav'
import StoryCard from '@/components/StoryCard'

export default function Home() {
  const [activeId, setActiveId] = useState<PropertyId>('miramar')
  const active = properties.find((p) => p.id === activeId)!
  const cards = getStoriesByProperty(activeId)

  return (
    <main className="pb-16">
      {/* Header */}
      <div className="px-4 pt-10 pb-5">
        <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-1">
          Tonight's briefing
        </p>
        <h1 className="font-serif text-3xl font-bold text-[#1C1917]">Origin Table</h1>
        <p className="text-sm text-[#78716C] mt-1">Know the story. Tell it well.</p>
      </div>

      {/* Property tabs */}
      <PropertyNav
        properties={properties}
        activeId={activeId}
        onSelect={setActiveId}
      />

      <div className="px-4 py-5 space-y-5">
        {/* Active property context */}
        <div
          className="rounded-2xl p-4 border"
          style={{
            borderColor: `${active.accentColor}40`,
            backgroundColor: `${active.accentColor}0d`,
          }}
        >
          <p
            className="text-[10px] font-semibold tracking-widest uppercase mb-1.5"
            style={{ color: active.accentColor }}
          >
            {active.propertyFullName} · {active.location}
          </p>
          <p className="font-serif text-[#1C1917] text-sm leading-relaxed italic">
            "{active.philosophy}"
          </p>
          <p className="text-[#78716C] text-xs mt-2.5">— {active.chefName}</p>
        </div>

        {/* Story cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#78716C]">
              Tonight's stories
            </p>
            <a
              href={`/quiz/${activeId}`}
              className="text-xs font-semibold hover:opacity-70 transition-opacity"
              style={{ color: active.accentColor }}
            >
              Quiz me →
            </a>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {cards.map((card) => (
              <StoryCard key={card.id} story={card} accentColor={active.accentColor} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
