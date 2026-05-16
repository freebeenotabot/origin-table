import { NextRequest, NextResponse } from 'next/server'
import { webSearch } from '@/lib/search'
import { synthesizeCard } from '@/lib/agent'
import { getProperty } from '@/lib/data'
import type { PropertyId } from '@/lib/types'

export async function POST(request: NextRequest) {
  const { role, propertyId, creationTitle, transcript, imageDataUrl } = await request.json()

  const property = getProperty(propertyId as PropertyId)
  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

  const searchResults = await webSearch(
    `${creationTitle} ${property.restaurantName} ${property.location} culinary history story technique`,
  )

  const partial = await synthesizeCard({
    role,
    propertyId: propertyId as PropertyId,
    propertyName: property.restaurantName,
    propertyLocation: property.location,
    creationTitle,
    transcript,
    imageDataUrl: imageDataUrl || undefined,
    searchResults,
  })

  const card = {
    ...partial,
    id: `created-${Date.now()}`,
    propertyId: propertyId as PropertyId,
    imageUrl: imageDataUrl || '',
  }

  return NextResponse.json({ card })
}
