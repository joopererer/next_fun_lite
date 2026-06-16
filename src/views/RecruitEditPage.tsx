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
import { useT } from '../i18n/LanguageContext'

export function RecruitEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isLoaded, isSignedIn } = useUser()
  const t = useT()
  const [activity, setActivity] = useState<ActivityWithCount | null>(null)
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await api.deleteActivity(id)
      router.push('/')
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Header />
      <SignInGate>
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
            <button
              type="button"
              className="w-full mt-3 py-2.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
            >
              {t.delete}
            </button>
          </main>
        )}
      </SignInGate>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-lg mb-2">删除招募？</h3>
            <p className="text-sm text-gray-500 mb-6">此操作不可撤销，招募活动将被永久删除。</p>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '删除中...' : t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
