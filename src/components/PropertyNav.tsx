import type { Property } from '@/lib/types'

interface Props {
  properties: Property[]
  activeId: string
  onSelect: (id: string) => void
}

export default function PropertyNav({ properties, activeId, onSelect }: Props) {
  return (
    <div className="flex border-b border-[#E7E0D8] bg-white overflow-x-auto">
      {properties.map((p) => {
        const isActive = p.id === activeId
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="relative py-3 px-4 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0"
            style={{ color: isActive ? p.accentColor : '#78716C' }}
          >
            {p.restaurantName}
            {isActive && (
              <span
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                style={{ backgroundColor: p.accentColor }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
