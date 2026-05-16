import { NextRequest, NextResponse } from 'next/server'
import { addCreatedStory } from '@/lib/store'
import type { StoryCard } from '@/lib/types'

export async function POST(request: NextRequest) {
  const { card } = await request.json() as { card: StoryCard }
  if (!card?.id) return NextResponse.json({ error: 'card is required' }, { status: 400 })

  addCreatedStory(card)
  return NextResponse.json({ id: card.id })
}
