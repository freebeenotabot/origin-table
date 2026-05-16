import Anthropic from '@anthropic-ai/sdk'
import type { StoryCard, PropertyId, Tag, GuestTag } from './types'
import type { SearchResult } from './search'

const client = new Anthropic()
const MODEL = 'claude-haiku-4-5-20251001'

const VALID_TAGS: Tag[] = [
  'sustainability', 'women-led', 'local-farm', 'cultural-heritage',
  'seasonal', 'wellness', 'award-winning', 'fire-cooking', 'zero-waste',
]
const VALID_GUEST_TAGS: GuestTag[] = [
  'environmentalist', 'women-rights', 'nutrition-focused', 'cultural-explorer',
  'wellness', 'vip-time-poor', 'aesthetics',
]

function stripFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  return {
    mediaType: match[1] as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
    data: match[2],
  }
}

export interface GenerateQuestionsInput {
  role: string
  creationTitle: string
  propertyName: string
  propertyLocation: string
  braindump: string
  searchResults: SearchResult[]
}

export async function generateQuestions(input: GenerateQuestionsInput): Promise<string[]> {
  const { role, creationTitle, propertyName, propertyLocation, braindump, searchResults } = input

  const searchCtx = searchResults.length
    ? `\nWeb research context (for inspiration):\n${searchResults.map((r) => `- ${r.title}: ${r.snippet}`).join('\n')}`
    : ''

  const prompt = `A ${role} at ${propertyName} (${propertyLocation}) shared information about their creation. Generate EXACTLY 3 short, focused questions to uncover hidden stories that floor staff would love to share with guests.

Creation: ${creationTitle}

What the creator shared:
${braindump}
${searchCtx}

Focus on: behind-the-scenes moments, specialty techniques, personal stories, sourcing relationships, cultural significance, or what makes it unique.

Return ONLY a JSON array of exactly 3 question strings, no other text:
["question 1", "question 2", "question 3"]`

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  try {
    return JSON.parse(stripFences(text)) as string[]
  } catch {
    return []
  }
}

export interface SynthesizeCardInput {
  role: string
  propertyId: PropertyId
  propertyName: string
  propertyLocation: string
  creationTitle: string
  transcript: string
  imageDataUrl?: string
  searchResults: SearchResult[]
}

export async function synthesizeCard(
  input: SynthesizeCardInput,
): Promise<Omit<StoryCard, 'id' | 'propertyId' | 'imageUrl'>> {
  const { role, propertyName, propertyLocation, creationTitle, transcript, imageDataUrl, searchResults } = input

  const searchCtx = searchResults.length
    ? `\nWeb research enrichment:\n${searchResults.map((r) => `- ${r.title}: ${r.snippet}`).join('\n')}`
    : ''

  const prompt = `Transform this creator's raw input into polished training material for luxury hotel floor staff at ${propertyName} (${propertyLocation}).

Role: ${role}
Creation: ${creationTitle}

Full session transcript:
${transcript}
${searchCtx}

Return a JSON object (no markdown fences) with EXACTLY this structure:
{
  "title": "short evocative title",
  "subtitle": "one sentence giving staff the essential context",
  "tags": [],
  "layers": {
    "headline": "one punchy sentence staff can lead with (the short story)",
    "story": "2-3 sentences of narrative context",
    "details": ["a precise name-drop detail", "another detail", "a third detail"]
  },
  "pronounceTargets": [
    {"term": "hard-to-pronounce ingredient or term", "phonetic": "fon-ET-ik", "language": "origin language"}
  ],
  "guestResonanceTags": [],
  "imageKeywords": ["keyword1", "keyword2", "keyword3"]
}

Valid tags (choose relevant): ${VALID_TAGS.join(', ')}
Valid guestResonanceTags (choose relevant): ${VALID_GUEST_TAGS.join(', ')}
If there are no hard-to-pronounce terms, return pronounceTargets as [].
imageKeywords: 3-5 English words suitable for an image search (food/ingredient/art names, cooking method, visual style).`

  const imageContent = imageDataUrl ? parseDataUrl(imageDataUrl) : null
  const userContent: Anthropic.MessageParam['content'] = imageContent
    ? [
        { type: 'image', source: { type: 'base64', media_type: imageContent.mediaType, data: imageContent.data } },
        { type: 'text', text: `[Image shows the creation — use it to inform visual descriptions.]\n\n${prompt}` },
      ]
    : prompt

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 900,
    messages: [{ role: 'user', content: userContent }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  return JSON.parse(stripFences(text))
}
