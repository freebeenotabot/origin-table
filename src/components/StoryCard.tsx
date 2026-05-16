import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import type { StoryCard as StoryCardType } from '@/lib/types'
import TagChip from './TagChip'

interface Props {
  story: StoryCardType
  accentColor: string
}

export default function StoryCard({ story, accentColor }: Props) {
  return (
    <Link href={`/stories/${story.id}`} className="block">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E0D8] overflow-hidden active:scale-[0.98] transition-transform">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={story.imageUrl}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3">
          <h3 className="font-serif font-semibold text-[14px] text-[#1C1917] leading-snug line-clamp-2">
            {story.title}
          </h3>
          {story.seasonalPeriod && (
            <div
              className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold tracking-wide rounded-full px-2 py-0.5"
              style={{ color: accentColor, backgroundColor: `${accentColor}15` }}
            >
              <CalendarDays size={9} />
              {story.seasonalPeriod}
            </div>
          )}
          <p className="text-[11px] text-[#78716C] mt-1 line-clamp-2 leading-snug">
            {story.subtitle}
          </p>

          <div className="flex flex-wrap gap-1 mt-2">
            {story.tags.slice(0, 2).map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
