import { TAG_LABELS } from '@/lib/data'

const TAG_STYLES: Record<string, string> = {
  sustainability: 'bg-emerald-100 text-emerald-800',
  'women-led': 'bg-rose-100 text-rose-800',
  'local-farm': 'bg-lime-100 text-lime-800',
  'cultural-heritage': 'bg-amber-100 text-amber-800',
  seasonal: 'bg-sky-100 text-sky-800',
  wellness: 'bg-teal-100 text-teal-800',
  'award-winning': 'bg-yellow-100 text-yellow-800',
  'fire-cooking': 'bg-orange-100 text-orange-800',
  'zero-waste': 'bg-green-100 text-green-800',
}

export default function TagChip({ tag }: { tag: string }) {
  const styles = TAG_STYLES[tag] ?? 'bg-zinc-100 text-zinc-700'
  const label = TAG_LABELS[tag] ?? tag
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${styles}`}>
      {label}
    </span>
  )
}
