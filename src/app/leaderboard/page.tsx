'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Award, Crown, Star, Trophy } from 'lucide-react'
import { getCurrentUser, getLeaderboard } from '@/lib/user'
import type { Employee, LeaderboardEntry } from '@/lib/types'

export default function LeaderboardPage() {
  const [mounted, setMounted] = useState(false)
  const [rows, setRows] = useState<LeaderboardEntry[]>([])
  const [me, setMe] = useState<Employee | null>(null)

  useEffect(() => {
    setMounted(true)
    setRows(getLeaderboard())
    setMe(getCurrentUser())
  }, [])

  const myRow = useMemo(
    () => (me ? rows.find((r) => r.employee.email === me.email) ?? null : null),
    [rows, me]
  )

  if (!mounted) {
    return (
      <main className="min-h-screen pb-16">
        <header className="sticky top-0 z-20 bg-white border-b border-[#E7E0D8]">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-1 text-[#78716C] text-sm">
              <ArrowLeft size={16} />
              Back
            </Link>
            <h1 className="font-serif text-[16px] font-bold text-[#1C1917]">Leaderboard</h1>
            <div className="w-10" />
          </div>
        </header>
        <div className="flex items-center justify-center pt-24">
          <div className="w-6 h-6 rounded-full border-2 border-[#E7E0D8] border-t-[#78716C] animate-spin" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-16">
      <header className="sticky top-0 z-20 bg-white border-b border-[#E7E0D8]">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-[#78716C] hover:text-[#1C1917] transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1 className="font-serif text-[16px] font-bold text-[#1C1917]">Leaderboard</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 pt-5 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-4 h-4 text-amber-600" />
          <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase">
            Origin Table — Service-ready ranking
          </p>
        </div>
        <p className="text-sm text-[#78716C] mb-5">
          Earn a <span className="font-medium text-emerald-700">Certification</span> by scoring 60%
          or higher on a property quiz. Hit 100% for a <span className="font-medium text-amber-700">Mastery</span> badge.
        </p>

        {myRow && (
          <div className="mb-5 bg-[#1C1917] text-white rounded-2xl px-4 py-3 flex items-center gap-3">
            <p className="font-serif font-bold text-xl tabular-nums w-7 text-center flex-shrink-0">
              #{myRow.rank}
            </p>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] tracking-widest uppercase text-white/60">Your rank</p>
              <p className="text-sm font-medium truncate">{myRow.employee.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums">{myRow.totalPoints} pts</p>
              <p className="text-[10px] text-white/60">
                {myRow.certifications} cert · {myRow.masteryBadges} mastery
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {rows.map((r) => (
            <Row key={r.employee.email} row={r} isMe={me?.email === r.employee.email} />
          ))}
        </div>
      </div>
    </main>
  )
}

function Row({ row, isMe }: { row: LeaderboardEntry; isMe: boolean }) {
  const { employee: e, rank, certifications, masteryBadges, totalPoints, attemptCount } = row
  const medalIcon =
    rank === 1 ? (
      <Crown className="w-4 h-4 text-amber-500" />
    ) : rank === 2 ? (
      <Star className="w-4 h-4 text-stone-400" />
    ) : rank === 3 ? (
      <Award className="w-4 h-4 text-orange-700" />
    ) : null

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-3 py-3 border ${
        isMe ? 'bg-amber-50 border-amber-300' : 'bg-white border-[#E7E0D8]'
      }`}
    >
      <div className="flex items-center gap-1.5 w-10 flex-shrink-0">
        <p className="font-serif font-bold text-base tabular-nums text-[#1C1917]">#{rank}</p>
        {medalIcon}
      </div>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
        style={{ backgroundColor: e.avatarColor }}
      >
        {e.avatarInitials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1C1917] truncate">{e.name}</p>
        <p className="text-[11px] text-[#78716C] truncate">{e.jobFunction}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => {
            const got = i < masteryBadges ? 'mastery' : i < certifications ? 'cert' : 'none'
            return (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  got === 'mastery'
                    ? 'bg-amber-500'
                    : got === 'cert'
                    ? 'bg-emerald-500'
                    : 'bg-stone-200'
                }`}
                aria-label={got}
              />
            )
          })}
        </div>
        <p className="text-[11px] text-[#78716C] tabular-nums">
          {totalPoints} pts · {attemptCount} taken
        </p>
      </div>
    </div>
  )
}
