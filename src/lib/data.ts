import type {
  Property,
  StoryCard,
  GuestProfile,
  QuizBank,
  PropertyId,
  Employee,
  QuizAttempt,
} from './types'
import { getCreatedStories } from './store'

// Import JSON — Next.js resolves these at build time
import _properties from '@/data/properties.json'
import _stories from '@/data/stories.json'
import _guests from '@/data/guests.json'
import _quiz from '@/data/quiz.json'
import _employees from '@/data/employees.json'
import _seedAttempts from '@/data/quiz-attempts.json'

export const properties = _properties as Property[]
export const stories = _stories as StoryCard[]
export const guests = _guests as GuestProfile[]
export const quizBank = _quiz as QuizBank
export const employees = _employees as Employee[]
export const seedAttempts = _seedAttempts as QuizAttempt[]

// A passing score certifies the employee on that property's menu story.
export const CERT_THRESHOLD = 60

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

// Employee helpers
export function getEmployee(email: string): Employee | undefined {
  return employees.find((e) => e.email === email)
}

export function getDirectReports(managerEmail: string): Employee[] {
  return employees.filter((e) => e.managerEmail === managerEmail)
}

export function getEmployeesByProperty(propertyId: PropertyId): Employee[] {
  return employees.filter((e) => e.propertyId === propertyId)
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

