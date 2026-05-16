import { properties } from '@/lib/data'
import { CreatorStudio } from '@/components/CreatorStudio'

export default function CreatePage() {
  return (
    <main>
      <CreatorStudio properties={properties} />
    </main>
  )
}
