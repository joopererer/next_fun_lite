'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { ActivityWithCount, Registration } from '../../shared/types'
import { ActivityForm } from '../components/admin/ActivityForm'
import { InfoForm } from '../components/info/InfoForm'
import { api, getEventUrl } from '../lib/api'
import { formatEventDate } from '../lib/user'
import { formatOrganizerContactLine, formatRegistrationContactLine } from '../lib/contact'
import { isInfoPost } from '../lib/infoVisibility'
import { DEFAULT_INFO_ACTION_LABEL } from '../../shared/infoDefaults'
import { Footer } from '../components/layout/Footer'

export function AdminActivityPage() {
  const { id } = useParams<{ id: string }>()
  const [activity, setActivity] = useState<ActivityWithCount | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!id) return
    Promise.all([api.getActivity(id), api.getRegistrations(id)])
      .then(([a, r]) => {
        setActivity(a)
        setRegistrations(r)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const exportList = () => {
    if (!activity) return
    const totalPeople = registrations.reduce((s, r) => s + r.participantCount, 0)
    const lines = registrations.map((r, i) => {
      const note = r.note ? ` 备注：${r.note}` : ''
      return `${i + 1}. ${r.name}（${formatRegistrationContactLine(r)}）×${r.participantCount}${note}`
    })
    const text = [
      `【${activity.title}】报名名单`,
      `共 ${registrations.length} 人报名，合计 ${totalPeople} 人参与`,
      ...lines,
    ].join('\n')
    navigator.clipboard.writeText(text)
    alert('名单已复制到剪贴板')
  }

  if (loading) {
    return <div className="text-center text-gray-400 py-16">加载中...</div>
  }

  if (!activity) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">活动不存在</p>
        <Link href="/admin" className="btn-primary">返回看板</Link>
      </div>
    )
  }

  const totalPeople = registrations.reduce((s, r) => s + r.participantCount, 0)
  const isInfo = isInfoPost(activity)

  return (
    <div className="min-h-screen flex flex-col pb-12">
      <header className="bg-white border-b border-gray-100">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-green-600">← 返回看板</Link>
          <h1 className="text-xl font-bold mt-2">{activity.title}</h1>
          <p className="text-sm text-gray-500">
            {isInfo
              ? `📢 资讯 · ${activity.organizerName}`
              : `${formatEventDate(activity.date)} · ${activity.location}`}
          </p>
        </div>
      </header>

      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 page-enter space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{isInfo ? '资讯信息' : '活动信息'}</h2>
            <button type="button" className="text-sm text-green-600" onClick={() => setEditing(!editing)}>
              {editing ? '取消编辑' : '编辑'}
            </button>
          </div>
          {editing ? (
            isInfo ? (
              <InfoForm
                mode="edit"
                initial={activity}
                editId={activity.id}
                onSuccess={() => { setEditing(false); load() }}
              />
            ) : (
              <ActivityForm
                initial={activity}
                editId={activity.id}
                onSuccess={() => { setEditing(false); load() }}
              />
            )
          ) : isInfo ? (
            <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-2 text-sm">
              <p>{activity.description || '暂无简介'}</p>
              {activity.infoPrice && <p>💰 {activity.infoPrice}</p>}
              {activity.infoStartTime && <p>开始：{formatEventDate(activity.infoStartTime)}</p>}
              {activity.infoDeadline && <p>截止：{formatEventDate(activity.infoDeadline)}</p>}
              {activity.infoActionUrl && (
                <p>
                  外链按钮：{activity.infoActionLabel || DEFAULT_INFO_ACTION_LABEL} →{' '}
                  <a href={activity.infoActionUrl} className="text-green-600 underline" target="_blank" rel="noreferrer">
                    {activity.infoActionUrl}
                  </a>
                </p>
              )}
              {activity.sourceUrl && (
                <p>
                  参考链接：{' '}
                  <a href={activity.sourceUrl} className="text-green-600 underline" target="_blank" rel="noreferrer">
                    {activity.sourceUrl}
                  </a>
                </p>
              )}
              <p className="text-gray-400">发布人：{activity.organizerName}</p>
              <button
                type="button"
                className="text-green-600 text-sm"
                onClick={() => navigator.clipboard.writeText(getEventUrl(activity.id))}
              >
                复制链接
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-2 text-sm">
              <p>{activity.description || '暂无简介'}</p>
              {activity.fee && <p>💰 {activity.fee}</p>}
              {activity.notes && <p className="whitespace-pre-wrap text-gray-600">{activity.notes}</p>}
              <p className="text-gray-400">
                发起人：{activity.organizerName} · {formatOrganizerContactLine(activity)}
              </p>
              <button
                type="button"
                className="text-green-600 text-sm"
                onClick={() => navigator.clipboard.writeText(getEventUrl(activity.id))}
              >
                复制报名链接
              </button>
            </div>
          )}
        </section>

        {!isInfo && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">报名名单</h2>
            <button type="button" className="btn-secondary text-sm" onClick={exportList}>
              导出名单
            </button>
          </div>
          {registrations.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无报名</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="py-2 pr-3">姓名</th>
                      <th className="py-2 pr-3">联系方式</th>
                      <th className="py-2 pr-3">人数</th>
                      <th className="py-2 pr-3">备注</th>
                      <th className="py-2">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r.id} className="border-b border-gray-50">
                        <td className="py-2.5 pr-3">{r.name}</td>
                        <td className="py-2.5 pr-3">{formatRegistrationContactLine(r)}</td>
                        <td className="py-2.5 pr-3">{r.participantCount}</td>
                        <td className="py-2.5 pr-3">{r.note || '-'}</td>
                        <td className="py-2.5 text-gray-400">
                          {new Date(r.registeredAt).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                合计：{registrations.length} 人报名，共 {totalPeople} 人参与
              </p>
            </>
          )}
        </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
