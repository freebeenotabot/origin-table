export type PropertyId = 'miramar' | 'bangkok' | 'san-miguel'

export type Tag =
  | 'sustainability'
  | 'women-led'
  | 'local-farm'
  | 'cultural-heritage'
  | 'seasonal'
  | 'wellness'
  | 'award-winning'
  | 'fire-cooking'
  | 'zero-waste'

export type GuestTag =
  | 'environmentalist'
  | 'women-rights'
  | 'nutrition-focused'
  | 'cultural-explorer'
  | 'wellness'
  | 'vip-time-poor'
  | 'aesthetics'

export interface PronounceTarget {
  term: string
  phonetic?: string
  language: string
}

export interface StoryLayers {
  headline: string
  story: string
  details: string[]
}

export interface StoryCard {
  id: string
  propertyId: PropertyId
  title: string
  subtitle: string
  imageUrl: string
  tags: Tag[]
  layers: StoryLayers
  pronounceTargets: PronounceTarget[]
  guestResonanceTags: GuestTag[]
}

export interface Property {
  id: PropertyId
  restaurantName: string
  propertyFullName: string
  location: string
  heroImageUrl: string
  cardImageUrl: string
  tagline: string
  chefName: string
  chefOrigin: string
  accentColor: string
  philosophy: string
  highlights: string[]
  storyCardIds: string[]
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface PropertyQuiz {
  propertyId: PropertyId
  title: string
  questions: QuizQuestion[]
}

export interface QuizBank {
  miramar: PropertyQuiz
  bangkok: PropertyQuiz
  'san-miguel': PropertyQuiz
}

// Tier 2
export interface GuestProfile {
  id: string
  name: string
  room: string
  arrivalTime: string
  propertyId: PropertyId
  avatarInitials: string
  avatarColor: string
  tags: GuestTag[]
  tagLabels: Partial<Record<GuestTag, string>>
  notes: string
  leadStoryIds: string[]
  avoidTopics: string[]
  briefingTalkingPoints: string[]
}

// API request / response shapes
export interface PronounceRequest {
  term: string
  language: string
}

export interface PronounceResponse {
  audioBase64: string
  cached: boolean
}

export interface BriefRequest {
  guestId: string
  propertyId: PropertyId
}

export interface BriefResponse {
  stories: string[]        // story card titles to lead with
  talkingPoints: string[]  // sentences staff say verbatim
  avoid: string[]          // topics to steer away from
}
