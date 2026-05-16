'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { StoryLayers } from '@/lib/types'

interface Props {
  layers: StoryLayers
  accentColor: string
}

function Section({
  label,
  children,
  defaultOpen = false,
  accentColor,
}: {
  label: string
  children: React.ReactNode
  defaultOpen?: boolean
  accentColor: string
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-t border-[#E7E0D8]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3.5 px-4 text-left min-h-[44px]"
      >
        <span
          className="text-[11px] font-semibold tracking-widest uppercase"
          style={{ color: accentColor }}
        >
          {label}
        </span>
        <ChevronDown
          size={16}
          className="text-[#78716C] transition-transform duration-200 flex-shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && <div className="pb-4 px-4">{children}</div>}
    </div>
  )
}

export default function LayeredContent({ layers, accentColor }: Props) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E7E0D8]">
      {/* Layer 1 — always open */}
      <div className="px-4 py-4">
        <p className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: accentColor }}>
          The Short Story
        </p>
        <p className="text-[15px] leading-relaxed text-[#1C1917] font-serif italic">
          {layers.headline}
        </p>
      </div>

      {/* Layer 2 */}
      <Section label="Go Deeper" accentColor={accentColor}>
        <p className="text-[14px] leading-relaxed text-[#44403C]">
          {layers.story}
        </p>
      </Section>

      {/* Layer 3 */}
      <Section label="Name-Drop Details" accentColor={accentColor}>
        <ul className="space-y-2">
          {layers.details.map((detail, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-[#44403C] leading-snug">
              <span className="mt-0.5 flex-shrink-0" style={{ color: accentColor }}>•</span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
