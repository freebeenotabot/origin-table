import type { Property, StoryCard, GuestProfile, QuizBank, PropertyId } from './types'
import { getCreatedStories } from './store'

// Import JSON — Next.js resolves these at build time
import _properties from '@/data/properties.json'
import _stories from '@/data/stories.json'
import _guests from '@/data/guests.json'
import _quiz from '@/data/quiz.json'

export const properties = _properties as Property[]
export const stories = _stories as StoryCard[]
export const guests = _guests as GuestProfile[]
export const quizBank = _quiz as QuizBank

// Helpers used across multiple components / routes

export function getProperty(id: PropertyId): Property | undefined {
  return properties.find((p) => p.id === id)
}

export function getStoriesByProperty(propertyId: PropertyId): StoryCard[] {
  return [...stories, ...getCreatedStories()].filter((s) => s.propertyId === propertyId)
}

export function getStory(id: string): StoryCard | undefined {
  return [...stories, ...getCreatedStories()].find((s) => s.id === id)
}

export function getGuest(id: string): GuestProfile | undefined {
  return guests.find((g) => g.id === id)
}

export function getStoriesForGuest(guest: GuestProfile): StoryCard[] {
  return guest.leadStoryIds
    .map((id) => getStory(id))
    .filter((s): s is StoryCard => s !== undefined)
}

export function getQuiz(propertyId: PropertyId) {
  return quizBank[propertyId] ?? null
}

// Tag display helpers
export const TAG_LABELS: Record<string, string> = {
  sustainability: 'Sustainability',
  'women-led': 'Women-Led',
  'local-farm': 'Local Farm',
  'cultural-heritage': 'Cultural Heritage',
  seasonal: 'Seasonal',
  wellness: 'Wellness',
  'award-winning': 'Award-Winning',
  'fire-cooking': 'Fire Cooking',
  'zero-waste': 'Zero Waste',
}

