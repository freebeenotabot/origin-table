import { TAG_LABELS } from '@/lib/data'

const TAG_STYLES: Record<string, string> = {
  sustainability:       'bg-stone-100 text-stone-600',
  'women-led':          'bg-rose-50 text-rose-700',
  'local-farm':         'bg-stone-100 text-stone-600',
  'cultural-heritage':  'bg-amber-50 text-amber-800',
  seasonal:             'bg-stone-100 text-stone-600',
  wellness:             'bg-stone-100 text-stone-600',
  'award-winning':      'bg-amber-50 text-amber-800',
  'fire-cooking':       'bg-orange-50 text-orange-800',
  'zero-waste':         'bg-stone-100 text-stone-600',
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
