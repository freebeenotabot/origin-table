import { NextRequest, NextResponse } from 'next/server'
import { webSearch } from '@/lib/search'
import { generateQuestions } from '@/lib/agent'
import { getProperty } from '@/lib/data'
import type { PropertyId } from '@/lib/types'

export async function POST(request: NextRequest) {
  const { role, creationTitle, propertyId, braindump } = await request.json()

  const property = getProperty(propertyId as PropertyId)
  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

  const searchResults = await webSearch(
    `${creationTitle} ${property.restaurantName} ${property.location} cuisine ingredients story origin`,
  )

  const questions = await generateQuestions({
    role,
    creationTitle,
    propertyName: property.restaurantName,
    propertyLocation: property.location,
    braindump,
    searchResults,
  })

  return NextResponse.json({ questions })
}
