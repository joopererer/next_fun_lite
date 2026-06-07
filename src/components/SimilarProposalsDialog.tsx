'use client'

import Link from 'next/link'
import type { SimilarProposalMatch } from '../../shared/activityDedupe'
import { similarMatchLabel } from '../../shared/activityDedupe'

interface Props {
  open: boolean
  matches: SimilarProposalMatch[]
  onConfirm: () => void
  onCancel: () => void
  confirming?: boolean
}

export function SimilarProposalsDialog({
  open,
  matches,
  onConfirm,
  onCancel,
  confirming = false,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl page-enter p-6">
        <h3 className="text-lg font-semibold mb-2">发现相似的提议</h3>
        <p className="text-sm text-gray-600 mb-4">
          库里可能已有类似内容。建议先查看已有提议，避免重复；如确认不同，仍可继续提交。
        </p>
        <ul className="space-y-2 mb-6 max-h-48 overflow-y-auto">
          {matches.map((m) => (
            <li key={m.id} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
              <p className="font-medium text-amber-950">{m.title}</p>
              <p className="text-xs text-amber-800 mt-0.5">
                {similarMatchLabel(m.status)}
                {m.location ? ` · ${m.location}` : ''}
              </p>
              <Link
                href={`/event/${m.id}`}
                target="_blank"
                className="text-xs text-green-700 underline mt-1 inline-block"
              >
                查看已有提议 →
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={onCancel} disabled={confirming}>
            返回修改
          </button>
          <button type="button" className="btn-primary flex-1" onClick={onConfirm} disabled={confirming}>
            {confirming ? '提交中...' : '仍然提交'}
          </button>
        </div>
      </div>
    </div>
  )
}
