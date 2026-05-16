import type { Property, StoryCard, GuestProfile, QuizBank, PropertyId } from './types'

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
  return stories.filter((s) => s.propertyId === propertyId)
}

export function getStory(id: string): StoryCard | undefined {
  return stories.find((s) => s.id === id)
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

export const TAG_COLORS: Record<string, string> = {
  sustainability: 'bg-emerald-900 text-emerald-300',
  'women-led': 'bg-pink-900 text-pink-300',
  'local-farm': 'bg-lime-900 text-lime-300',
  'cultural-heritage': 'bg-amber-900 text-amber-300',
  seasonal: 'bg-sky-900 text-sky-300',
  wellness: 'bg-teal-900 text-teal-300',
  'award-winning': 'bg-yellow-900 text-yellow-300',
  'fire-cooking': 'bg-orange-900 text-orange-300',
  'zero-waste': 'bg-green-900 text-green-300',
}
