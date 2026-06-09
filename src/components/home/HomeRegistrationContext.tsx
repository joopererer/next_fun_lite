'use client'

import { useUser } from '@clerk/nextjs'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/src/lib/api'
import { ACTIVITIES_CHANGED_EVENT, consumeActivitiesDirtyFlag } from '@/src/lib/activityEvents'
import { getGuestRegistrations } from '@/src/lib/guestRegistrations'

interface HomeRegistrationContextValue {
  registeredIds: Set<string>
  markRegistered: (activityId: string) => void
}

const HomeRegistrationContext = createContext<HomeRegistrationContextValue | null>(null)

export function HomeRegistrationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set())

  const syncRegistrations = useCallback(async () => {
    const guestIds = getGuestRegistrations().map((r) => r.activityId)
    if (!isSignedIn) {
      setRegisteredIds(new Set(guestIds))
      return
    }
    try {
      const { registrations } = await api.getMyRegistrations()
      const ids = new Set(Object.keys(registrations))
      guestIds.forEach((gid) => ids.add(gid))
      setRegisteredIds(ids)
    } catch {
      setRegisteredIds(new Set(guestIds))
    }
  }, [isSignedIn])

  useEffect(() => {
    if (!isLoaded) return
    syncRegistrations()
  }, [isLoaded, isSignedIn, syncRegistrations])

  useEffect(() => {
    if (consumeActivitiesDirtyFlag()) {
      syncRegistrations()
      router.refresh()
    }
  }, [router, syncRegistrations])

  useEffect(() => {
    const refresh = () => {
      syncRegistrations()
      router.refresh()
      consumeActivitiesDirtyFlag()
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    window.addEventListener('pageshow', refresh)
    window.addEventListener(ACTIVITIES_CHANGED_EVENT, refresh)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('pageshow', refresh)
      window.removeEventListener(ACTIVITIES_CHANGED_EVENT, refresh)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [syncRegistrations, router])

  const markRegistered = useCallback((activityId: string) => {
    setRegisteredIds((prev) => new Set([...prev, activityId]))
  }, [])

  const value = useMemo(
    () => ({ registeredIds, markRegistered }),
    [registeredIds, markRegistered],
  )

  return (
    <HomeRegistrationContext.Provider value={value}>
      {children}
    </HomeRegistrationContext.Provider>
  )
}

export function useHomeRegistration(): HomeRegistrationContextValue {
  const ctx = useContext(HomeRegistrationContext)
  if (!ctx) {
    throw new Error('useHomeRegistration must be used within HomeRegistrationProvider')
  }
  return ctx
}
