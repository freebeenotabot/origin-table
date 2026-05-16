import { NextRequest, NextResponse } from 'next/server'
import { webSearch } from '@/lib/search'
import { synthesizeCard } from '@/lib/agent'
import { getProperty } from '@/lib/data'
import type { PropertyId } from '@/lib/types'

async function fetchUnsplashImage(keywords: string[]): Promise<string> {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key || !keywords.length) return ''
  try {
    const query = keywords.join(' ')
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${key}`,
      { signal: AbortSignal.timeout(5000) },
    )
    if (!res.ok) return ''
    const data = await res.json() as { urls?: { regular?: string } }
    return data.urls?.regular ?? ''
  } catch {
    return ''
  }
}

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

  const imageKeywords: string[] = (partial as Record<string, unknown>).imageKeywords as string[] ?? []

  let imageUrl = imageDataUrl || ''
  if (!imageUrl) {
    imageUrl = await fetchUnsplashImage(imageKeywords)
    if (!imageUrl) imageUrl = property.heroImageUrl || ''
  }

  const card = {
    ...partial,
    id: `created-${Date.now()}`,
    propertyId: propertyId as PropertyId,
    imageUrl,
  }

  return NextResponse.json({ card })
}
