'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import type { ActivityWithCount } from '../../shared/types'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { SignInGate } from '../components/SignInGate'
import { RecruitForm } from '../components/recruit/RecruitForm'
import { api } from '../lib/api'
import { canOrganizerEditActivity } from '../lib/organizerEdit'
import { useUser } from '@clerk/nextjs'

export function RecruitEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isLoaded, isSignedIn } = useUser()
  const [activity, setActivity] = useState<ActivityWithCount | null>(null)
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    if (!id || !isLoaded) return
    if (!isSignedIn) {
      setLoading(false)
      return
    }
    api.getActivity(id)
      .then((a) => {
        if (a.status !== 'recruiting') {
          setForbidden(true)
          return
        }
        if (!canOrganizerEditActivity(a, user?.id)) {
          setForbidden(true)
          return
        }
        setActivity(a)
      })
      .catch(() => setForbidden(true))
      .finally(() => setLoading(false))
  }, [id, isLoaded, isSignedIn, user?.id])

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Header />
      <SignInGate message="登录后即可编辑招募">
        {loading ? (
          <div className="text-center text-gray-400 py-16">加载中...</div>
        ) : forbidden || !activity ? (
          <main className="max-w-lg mx-auto px-4 py-16 text-center">
            <p className="text-gray-600 mb-4">无法编辑此活动</p>
            <Link href={id ? `/event/${id}` : '/'} className="btn-primary">返回活动页</Link>
          </main>
        ) : (
          <main className="max-w-lg mx-auto px-4 py-6 page-enter w-full">
            <Link href={`/event/${activity.id}`} className="text-sm text-gray-400 hover:text-green-600 mb-4 inline-block">
              ← 返回活动页
            </Link>
            <h1 className="text-2xl font-bold mb-6">编辑招募</h1>
            <RecruitForm
              mode="organizer"
              initial={activity}
              editId={activity.id}
              onSuccess={() => router.push(`/event/${activity.id}`)}
            />
          </main>
        )}
      </SignInGate>
      <Footer />
    </div>
  )
}
