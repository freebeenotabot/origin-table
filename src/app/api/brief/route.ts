import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getGuest, getStoriesByProperty } from '@/lib/data'
import type { BriefRequest, BriefResponse, PropertyId } from '@/lib/types'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const { guestId, propertyId } = await request.json() as BriefRequest

  const guest = getGuest(guestId)
  if (!guest) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  }

  const propertyStories = getStoriesByProperty(propertyId as PropertyId)
  if (propertyStories.length === 0) {
    return NextResponse.json({ error: 'No stories found for property' }, { status: 404 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })
  }

  const storyList = propertyStories
    .map((s) => `- "${s.title}": ${s.layers.headline}`)
    .join('\n')

  const prompt = `You are briefing a luxury hotel service staff member at Rosewood Hotels before dinner service. Be concise and practical — this staff member has 2 minutes to read this.

Guest: ${guest.name}, Room ${guest.room}
Guest values and interests: ${guest.tags.join(', ')}
Staff notes: ${guest.notes}

Available story cards for tonight's menu at this property:
${storyList}

Return a JSON object with EXACTLY this structure — no extra text, no markdown, just the JSON:
{
  "stories": ["exact story title 1", "exact story title 2", "exact story title 3"],
  "talkingPoints": ["a confident one-sentence talking point to say at the table", "another one-sentence talking point", "a third one-sentence talking point"],
  "avoid": ["topic or framing to avoid", "another topic to avoid"]
}

Rules:
- "stories": choose the 3 story titles that will resonate most with this guest's values — use EXACT titles from the list above
- "talkingPoints": write sentences the staff member can say verbatim — natural, warm, confident, under 25 words each
- "avoid": name specific topics or framings that would land poorly with this guest`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Unexpected Claude response type' }, { status: 500 })
  }

  // Strip markdown code fences if Claude wraps the JSON
  const raw = content.text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')

  let brief: BriefResponse
  try {
    brief = JSON.parse(raw)
  } catch {
    console.error('Failed to parse Claude response:', raw)
    return NextResponse.json({ error: 'Failed to parse briefing' }, { status: 500 })
  }

  return NextResponse.json(brief)
}
