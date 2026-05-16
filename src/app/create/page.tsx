import { properties } from '@/lib/data'
import { CreatorStudio } from '@/components/CreatorStudio'

export default function CreatePage() {
  return (
    <main className="min-h-screen pb-16">
      <CreatorStudio properties={properties} />
    </main>
  )
}
