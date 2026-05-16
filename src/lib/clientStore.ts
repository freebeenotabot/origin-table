import type { StoryCard } from './types'

const KEY = 'ot:createdStories'

export function getLocalStories(): StoryCard[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as StoryCard[]) : []
  } catch { return [] }
}

export function saveLocalStory(card: StoryCard): void {
  if (typeof window === 'undefined') return
  const stories = getLocalStories().filter((s) => s.id !== card.id)
  stories.push(card)
  localStorage.setItem(KEY, JSON.stringify(stories))
}

export function getLocalStory(id: string): StoryCard | undefined {
  return getLocalStories().find((s) => s.id === id)
}
