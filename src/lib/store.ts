import type { StoryCard } from './types'

const createdStories: StoryCard[] = []

export function getCreatedStories(): StoryCard[] {
  return createdStories
}

export function addCreatedStory(card: StoryCard): void {
  createdStories.push(card)
}
