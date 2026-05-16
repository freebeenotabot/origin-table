'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LogIn, X } from 'lucide-react'
import { employees, getProperty } from '@/lib/data'
import { getCurrentUser, setCurrentUser } from '@/lib/user'
import type { Employee, PropertyId } from '@/lib/types'

export default function UserBadge() {
  const [user, setUser] = useState<Employee | null>(null)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setUser(getCurrentUser())
  }, [])

  function pick(email: string) {
    setCurrentUser(email)
    setUser(getCurrentUser())
    setOpen(false)
  }

  function signOut() {
    setCurrentUser(null)
    setUser(null)
    setOpen(false)
  }

  // Avoid SSR/CSR flash: render a neutral placeholder until mounted.
  if (!mounted) {
    return <div className="w-8 h-8 rounded-full bg-[#E7E0D8]" aria-hidden />
  }

  return (
    <>
      {user ? (
        <Link
          href="/profile"
          className="flex items-center gap-2 active:opacity-70 transition-opacity"
          aria-label={`Profile: ${user.name}`}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.avatarInitials}
          </div>
        </Link>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-[#1C1917] active:opacity-70 transition-opacity"
        >
          <LogIn size={15} />
          <span>Sign in</span>
        </button>
      )}

      {open && <LoginSheet onPick={pick} onSignOut={user ? signOut : null} onClose={() => setOpen(false)} />}

      {/* When the user has a profile link AND wants to switch — they hit "Switch user" on /profile,
          which sets a query flag we can read. We don't need that here. */}
    </>
  )
}

interface SheetProps {
  onPick: (email: string) => void
  onSignOut: (() => void) | null
  onClose: () => void
}

export function LoginSheet({ onPick, onSignOut, onClose }: SheetProps) {
  const byProperty = employees.reduce<Record<PropertyId, Employee[]>>(
    (acc, e) => {
      ;(acc[e.propertyId] ??= []).push(e)
      return acc
    },
    {} as Record<PropertyId, Employee[]>
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-[#E7E0D8] px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-[#1C1917] text-lg">Sign in as</h2>
            <p className="text-[11px] text-[#78716C]">Demo mode — pick any staff member</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 -mr-1 text-[#78716C] active:opacity-70"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-5">
          {(Object.keys(byProperty) as PropertyId[]).map((pid) => {
            const p = getProperty(pid)
            if (!p) return null
            return (
              <div key={pid}>
                <p
                  className="text-[10px] font-semibold tracking-widest uppercase mb-2"
                  style={{ color: p.accentColor }}
                >
                  {p.restaurantName} · {p.location.split(',')[0]}
                </p>
                <div className="space-y-1.5">
                  {byProperty[pid].map((e) => (
                    <button
                      key={e.email}
                      onClick={() => onPick(e.email)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 active:bg-stone-100 transition-colors text-left"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0"
                        style={{ backgroundColor: e.avatarColor }}
                      >
                        {e.avatarInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#1C1917] truncate">{e.name}</p>
                        <p className="text-[11px] text-[#78716C] truncate">{e.jobFunction}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full py-3 mt-2 mb-1 rounded-xl border border-[#E7E0D8] text-[#78716C] text-sm font-medium active:bg-stone-50"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
