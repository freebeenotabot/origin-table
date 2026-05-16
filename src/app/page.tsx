import { properties, stories } from '@/lib/data'
import { getCreatedStories } from '@/lib/store'
import HomeClient from '@/components/HomeClient'

// Force dynamic so published cards from the runtime store appear immediately
export const dynamic = 'force-dynamic'

export default function Home() {
  const allStories = [...stories, ...getCreatedStories()]
  return <HomeClient properties={properties} allStories={allStories} />
}
