'use client'

import { useEffect, type ReactNode } from 'react'

interface ModalSheetProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  /** Higher z-index for profile overlay, etc. */
  zIndexClass?: string
}

export function ModalSheet({
  open,
  onClose,
  title,
  children,
  footer,
  zIndexClass = 'z-50',
}: ModalSheetProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-end sm:items-center justify-center p-0 sm:p-4`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="关闭"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex flex-col w-full sm:max-w-md max-h-[min(92dvh,720px)] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden page-enter"
      >
        {title != null && (
          <div className="shrink-0 flex items-start justify-between gap-2 px-4 pt-3 pb-2 sm:px-5 sm:pt-4 sm:pb-3 border-b border-gray-100">
            <div className="text-base sm:text-lg font-semibold leading-snug min-w-0">{title}</div>
            <button
              type="button"
              className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
              onClick={onClose}
              aria-label="关闭"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
          {children}
        </div>
        {footer != null && (
          <div className="shrink-0 border-t border-gray-200 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
