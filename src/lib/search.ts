export interface SearchResult {
  title: string
  snippet: string
}

export async function webSearch(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) return []
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, query, max_results: 4, search_depth: 'basic' }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const data = await res.json() as { results?: { title: string; content: string }[] }
    return (data.results ?? []).slice(0, 4).map((r) => ({
      title: r.title,
      snippet: (r.content ?? '').slice(0, 200),
    }))
  } catch {
    return []
  }
}
