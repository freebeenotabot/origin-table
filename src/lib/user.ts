'use client'

import {
  CERT_THRESHOLD,
  employees,
  getEmployee,
  properties,
  seedAttempts,
} from './data'
import type {
  Employee,
  LeaderboardEntry,
  PropertyId,
  QuizAttempt,
} from './types'

const USER_KEY = 'ot:currentUserEmail'
const ATTEMPTS_KEY = 'ot:quizAttempts'

function safeStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getCurrentUserEmail(): string | null {
  return safeStorage()?.getItem(USER_KEY) ?? null
}

export function getCurrentUser(): Employee | null {
  const email = getCurrentUserEmail()
  return email ? getEmployee(email) ?? null : null
}

export function setCurrentUser(email: string | null): void {
  const s = safeStorage()
  if (!s) return
  if (email === null) s.removeItem(USER_KEY)
  else s.setItem(USER_KEY, email)
}

function loadLocalAttempts(): QuizAttempt[] {
  const raw = safeStorage()?.getItem(ATTEMPTS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as QuizAttempt[]) : []
  } catch {
    return []
  }
}

function writeLocalAttempts(list: QuizAttempt[]): void {
  safeStorage()?.setItem(ATTEMPTS_KEY, JSON.stringify(list))
}

export function saveAttempt(input: Omit<QuizAttempt, 'id' | 'completedAt'>): QuizAttempt {
  const attempt: QuizAttempt = {
    ...input,
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    completedAt: new Date().toISOString(),
  }
  const list = loadLocalAttempts()
  list.push(attempt)
  writeLocalAttempts(list)
  return attempt
}

export function getAllAttempts(): QuizAttempt[] {
  return [...seedAttempts, ...loadLocalAttempts()]
}

export function getAttemptsForEmployee(email: string): QuizAttempt[] {
  return getAllAttempts()
    .filter((a) => a.employeeEmail === email)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
}

export interface CertificationStatus {
  propertyId: PropertyId
  bestPercent: number | null
  certified: boolean
  mastered: boolean
  attempts: number
  lastAttemptAt: string | null
}

export function getCertifications(email: string): CertificationStatus[] {
  const mine = getAllAttempts().filter((a) => a.employeeEmail === email)
  return properties.map((p) => {
    const onProp = mine.filter((a) => a.propertyId === p.id)
    if (onProp.length === 0) {
      return {
        propertyId: p.id,
        bestPercent: null,
        certified: false,
        mastered: false,
        attempts: 0,
        lastAttemptAt: null,
      }
    }
    const best = onProp.reduce((m, a) => Math.max(m, a.percent), 0)
    const last = onProp.reduce(
      (m, a) => (a.completedAt > m ? a.completedAt : m),
      onProp[0].completedAt
    )
    return {
      propertyId: p.id,
      bestPercent: best,
      certified: best >= CERT_THRESHOLD,
      mastered: best === 100,
      attempts: onProp.length,
      lastAttemptAt: last,
    }
  })
}

export function getLeaderboard(): LeaderboardEntry[] {
  const all = getAllAttempts()
  const rows = employees.map<Omit<LeaderboardEntry, 'rank'>>((emp) => {
    const certs = getCertificationsFromList(emp.email, all)
    const taken = certs.filter((c) => c.bestPercent !== null)
    const totalPoints = taken.reduce((sum, c) => sum + (c.bestPercent ?? 0), 0)
    const attemptCount = all.filter((a) => a.employeeEmail === emp.email).length
    const lastAttemptAt =
      taken
        .map((c) => c.lastAttemptAt)
        .filter((d): d is string => d !== null)
        .sort()
        .pop() ?? null
    return {
      employee: emp,
      certifications: certs.filter((c) => c.certified).length,
      masteryBadges: certs.filter((c) => c.mastered).length,
      totalPoints,
      attemptCount,
      lastAttemptAt,
    }
  })
  rows.sort((a, b) => {
    if (b.certifications !== a.certifications) return b.certifications - a.certifications
    if (b.masteryBadges !== a.masteryBadges) return b.masteryBadges - a.masteryBadges
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
    return a.employee.name.localeCompare(b.employee.name)
  })
  return rows.map((r, i) => ({ ...r, rank: i + 1 }))
}

function getCertificationsFromList(
  email: string,
  all: QuizAttempt[]
): CertificationStatus[] {
  const mine = all.filter((a) => a.employeeEmail === email)
  return properties.map((p) => {
    const onProp = mine.filter((a) => a.propertyId === p.id)
    if (onProp.length === 0) {
      return {
        propertyId: p.id,
        bestPercent: null,
        certified: false,
        mastered: false,
        attempts: 0,
        lastAttemptAt: null,
      }
    }
    const best = onProp.reduce((m, a) => Math.max(m, a.percent), 0)
    const last = onProp.reduce(
      (m, a) => (a.completedAt > m ? a.completedAt : m),
      onProp[0].completedAt
    )
    return {
      propertyId: p.id,
      bestPercent: best,
      certified: best >= CERT_THRESHOLD,
      mastered: best === 100,
      attempts: onProp.length,
      lastAttemptAt: last,
    }
  })
}
