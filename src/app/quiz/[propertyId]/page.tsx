import { notFound } from 'next/navigation'
import { getQuiz, getProperty } from '@/lib/data'
import { QuizClient } from '@/components/QuizClient'
import type { PropertyId } from '@/lib/types'

interface Props {
  params: { propertyId: string }
}

export default function QuizPage({ params }: Props) {
  const pid = params.propertyId as PropertyId
  const quiz = getQuiz(pid)
  const property = getProperty(pid)

  if (!quiz || !property) notFound()

  return (
    <main className="min-h-screen pb-16">
      <QuizClient quiz={quiz} property={property} />
    </main>
  )
}
