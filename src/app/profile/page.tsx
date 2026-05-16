'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Award,
  Briefcase,
  Mail,
  MapPin,
  Medal,
  Phone,
  Trophy,
  UserCog,
  Users,
} from 'lucide-react'
import { getDirectReports, getEmployee, getProperty } from '@/lib/data'
import {
  CertificationStatus,
  getAttemptsForEmployee,
  getCertifications,
  getCurrentUser,
  setCurrentUser,
} from '@/lib/user'
import { LoginSheet } from '@/components/UserBadge'
import type { Employee, QuizAttempt } from '@/lib/types'

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<Employee | null>(null)
  const [showSwitcher, setShowSwitcher] = useState(false)

  useEffect(() => {
    setMounted(true)
    setUser(getCurrentUser())
  }, [])

  function pick(email: string) {
    setCurrentUser(email)
    setUser(getCurrentUser())
    setShowSwitcher(false)
  }

  function signOut() {
    setCurrentUser(null)
    setUser(null)
    setShowSwitcher(false)
  }

  if (!mounted) {
    return (
      <main className="min-h-screen pb-16">
        <header className="sticky top-0 z-20 bg-white border-b border-[#E7E0D8]">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-1 text-[#78716C] text-sm">
              <ArrowLeft size={16} />
              Back
            </Link>
            <h1 className="font-serif text-[16px] font-bold text-[#1C1917]">Profile</h1>
            <div className="w-10" />
          </div>
        </header>
        <div className="flex items-center justify-center pt-24">
          <div className="w-6 h-6 rounded-full border-2 border-[#E7E0D8] border-t-[#78716C] animate-spin" />
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen pt-12 px-4 max-w-md mx-auto text-center">
        <p className="text-[10px] font-semibold tracking-widest text-[#78716C] uppercase mb-2">
          Profile
        </p>
        <h1 className="font-serif font-bold text-[#1C1917] text-2xl mb-3">No one signed in</h1>
        <p className="text-[#78716C] text-sm mb-8">
          Pick a staff member to see their certifications and recent quiz history.
        </p>
        <button
          onClick={() => setShowSwitcher(true)}
          className="w-full py-4 bg-[#1C1917] text-white font-semibold rounded-2xl active:opacity-90 transition-opacity text-sm"
        >
          Sign in
        </button>
        <Link
          href="/"
          className="block mt-4 text-[#78716C] hover:text-[#1C1917] text-sm transition-colors"
        >
          ← Back to stories
        </Link>
        {showSwitcher && (
          <LoginSheet onPick={pick} onSignOut={null} onClose={() => setShowSwitcher(false)} />
        )}
      </main>
    )
  }

  return (
    <SignedInProfile
      user={user}
      onOpenSwitcher={() => setShowSwitcher(true)}
      showSwitcher={showSwitcher}
      onPick={pick}
      onSignOut={signOut}
      onCloseSwitcher={() => setShowSwitcher(false)}
    />
  )
}

interface SignedInProps {
  user: Employee
  onOpenSwitcher: () => void
  showSwitcher: boolean
  onPick: (email: string) => void
  onSignOut: () => void
  onCloseSwitcher: () => void
}

function SignedInProfile({
  user,
  onOpenSwitcher,
  showSwitcher,
  onPick,
  onSignOut,
  onCloseSwitcher,
}: SignedInProps) {
  const manager = user.managerEmail ? getEmployee(user.managerEmail) : null
  const reports = getDirectReports(user.email)
  const certs = useMemo(() => getCertifications(user.email), [user.email])
  const attempts = useMemo(() => getAttemptsForEmployee(user.email), [user.email])
  const certifiedCount = certs.filter((c) => c.certified).length
  const masteryCount = certs.filter((c) => c.mastered).length

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
          <h1 className="font-serif text-[16px] font-bold text-[#1C1917]">Profile</h1>
          <button
            onClick={onOpenSwitcher}
            className="text-sm font-medium text-[#78716C] active:opacity-70"
          >
            Switch
          </button>
        </div>
      </header>

      <div className="px-4 pt-5 max-w-md mx-auto">
        {/* Identity card */}
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.avatarInitials}
          </div>
          <div className="min-w-0">
            <h2 className="font-serif font-bold text-[#1C1917] text-xl truncate">{user.name}</h2>
            <p className="text-sm text-[#78716C] truncate">{user.jobFunction}</p>
          </div>
        </div>

        {/* Contact rows */}
        <div className="bg-white border border-[#E7E0D8] rounded-2xl divide-y divide-[#E7E0D8] mb-5">
          <Row icon={<Mail size={14} />} label="Email" value={user.email} />
          <Row icon={<Phone size={14} />} label="Phone" value={user.phone} />
          <Row icon={<Briefcase size={14} />} label="Job function" value={user.jobFunction} />
          <Row icon={<MapPin size={14} />} label="Location" value={user.location} />
          <Row
            icon={<UserCog size={14} />}
            label="Manager"
            value={manager ? `${manager.name} · ${manager.jobFunction}` : 'None (top of chain)'}
          />
        </div>

        {/* Cert summary */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <Stat label="Certifications" value={`${certifiedCount}/3`} accent="#2D6A4F" />
          <Stat label="Mastery" value={`${masteryCount}/3`} accent="#C9A84C" />
          <Stat label="Quizzes taken" value={attempts.length.toString()} accent="#1C1917" />
        </div>

        {/* Per-property certifications */}
        <SectionTitle icon={<Award size={14} />}>Certifications by property</SectionTitle>
        <div className="space-y-2 mb-6">
          {certs.map((c) => (
            <CertRow key={c.propertyId} cert={c} />
          ))}
        </div>

        {/* Recent attempts */}
        <SectionTitle icon={<Medal size={14} />}>Recent attempts</SectionTitle>
        <div className="space-y-2 mb-6">
          {attempts.length === 0 ? (
            <p className="text-sm text-[#78716C] px-1 py-2">
              No quizzes taken yet — head to the home screen to start.
            </p>
          ) : (
            attempts.slice(0, 8).map((a) => <AttemptRow key={a.id} attempt={a} />)
          )}
        </div>

        {/* Direct reports — only shown if user has any */}
        {reports.length > 0 && (
          <>
            <SectionTitle icon={<Users size={14} />}>Direct reports</SectionTitle>
            <div className="space-y-1.5 mb-6">
              {reports.map((r) => (
                <ReportRow key={r.email} employee={r} />
              ))}
            </div>
          </>
        )}

        {/* Leaderboard CTA */}
        <Link
          href="/leaderboard"
          className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm text-white w-full bg-[#1C1917] active:opacity-90 transition-opacity"
        >
          <Trophy size={16} />
          See the leaderboard
        </Link>
      </div>

      {showSwitcher && (
        <LoginSheet onPick={onPick} onSignOut={onSignOut} onClose={onCloseSwitcher} />
      )}
    </main>
  )
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-[#78716C]">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-[#78716C] mb-0.5">{label}</p>
        <p className="text-sm text-[#1C1917] truncate">{value}</p>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-white border border-[#E7E0D8] rounded-2xl py-3 px-2 text-center">
      <p className="font-serif font-bold text-2xl" style={{ color: accent }}>
        {value}
      </p>
      <p className="text-[10px] tracking-widest uppercase text-[#78716C] mt-0.5">{label}</p>
    </div>
  )
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-[#78716C] mb-2 mt-1">
      {icon}
      <span>{children}</span>
    </div>
  )
}

function CertRow({ cert }: { cert: CertificationStatus }) {
  const p = getProperty(cert.propertyId)
  if (!p) return null
  const earned = cert.certified
  const mastered = cert.mastered
  return (
    <Link
      href={`/quiz/${p.id}`}
      className="flex items-center gap-3 bg-white border border-[#E7E0D8] rounded-2xl px-3 py-3 active:bg-stone-50 transition-colors"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
        style={{ backgroundColor: p.accentColor }}
      >
        {p.restaurantName.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1C1917] truncate">{p.restaurantName}</p>
        <p className="text-[11px] text-[#78716C] truncate">
          {cert.bestPercent === null
            ? 'Not attempted yet'
            : `Best: ${cert.bestPercent}% · ${cert.attempts} attempt${cert.attempts > 1 ? 's' : ''}`}
        </p>
      </div>
      {mastered ? (
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-800 whitespace-nowrap">
          ★ MASTERED
        </span>
      ) : earned ? (
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 whitespace-nowrap">
          CERTIFIED
        </span>
      ) : cert.bestPercent === null ? (
        <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-stone-100 text-[#78716C] whitespace-nowrap">
          New
        </span>
      ) : (
        <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-stone-100 text-[#78716C] whitespace-nowrap">
          Retry
        </span>
      )}
    </Link>
  )
}

function AttemptRow({ attempt }: { attempt: QuizAttempt }) {
  const p = getProperty(attempt.propertyId)
  const date = new Date(attempt.completedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
  return (
    <div className="flex items-center gap-3 bg-white border border-[#E7E0D8] rounded-xl px-3 py-2.5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
        style={{ backgroundColor: p?.accentColor ?? '#1C1917' }}
      >
        {(p?.restaurantName ?? '??').slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#1C1917] truncate">{p?.restaurantName ?? attempt.propertyId}</p>
        <p className="text-[11px] text-[#78716C]">{date}</p>
      </div>
      <p
        className={`text-sm font-semibold tabular-nums ${
          attempt.percent === 100
            ? 'text-amber-700'
            : attempt.percent >= 60
            ? 'text-emerald-700'
            : 'text-[#78716C]'
        }`}
      >
        {attempt.score}/{attempt.total}
      </p>
    </div>
  )
}

function ReportRow({ employee }: { employee: Employee }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-[#E7E0D8] rounded-xl px-3 py-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
        style={{ backgroundColor: employee.avatarColor }}
      >
        {employee.avatarInitials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#1C1917] truncate">{employee.name}</p>
        <p className="text-[11px] text-[#78716C] truncate">{employee.jobFunction}</p>
      </div>
    </div>
  )
}
