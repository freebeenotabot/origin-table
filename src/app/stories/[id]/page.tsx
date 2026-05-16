import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getStory, getProperty } from '@/lib/data'
import TagChip from '@/components/TagChip'
import LayeredContent from '@/components/LayeredContent'
import PronounceButton from '@/components/PronounceButton'

interface Props {
  params: { id: string }
}

export default function StoryPage({ params }: Props) {
  const card = getStory(params.id)
  if (!card) notFound()

  const property = getProperty(card.propertyId)
  const accentColor = property?.accentColor ?? '#B5451B'

  return (
    <main className="pb-16">
      {/* Hero image */}
      <div className="relative h-64">
        <img
          src={card.imageUrl}
          alt={card.title}
          className="w-full h-full object-cover"
        />
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
        {/* Title block */}
        <div>
          <h1 className="font-serif font-bold text-[#1C1917] text-2xl leading-tight mb-1.5">
            {card.title}
          </h1>
          <p className="text-[#78716C] text-sm leading-relaxed">{card.subtitle}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>

        {/* Pronunciation */}
        {card.pronounceTargets.length > 0 && (
          <div className="bg-white border border-[#E7E0D8] rounded-2xl p-4 shadow-sm">
            <p
              className="text-[10px] font-semibold tracking-widest uppercase mb-3"
              style={{ color: accentColor }}
            >
              Say it right
            </p>
            <div className="flex flex-col gap-3">
              {card.pronounceTargets.map((target) => (
                <PronounceButton
                  key={target.term}
                  target={target}
                  accentColor={accentColor}
                  size="md"
                />
              ))}
            </div>
          </div>
        )}

        {/* Layered story content */}
        <LayeredContent layers={card.layers} accentColor={accentColor} />

        {/* Quiz CTA */}
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
