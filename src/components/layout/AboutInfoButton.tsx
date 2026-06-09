'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ABOUT_INTRO, ABOUT_SECTIONS } from '../../../shared/aboutContent'

const iconButtonClass =
  'flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors'

export function AboutInfoButton() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const modal =
    open &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40"
        onClick={() => setOpen(false)}
        role="presentation"
      >
        <div
          className="flex flex-col w-full max-w-lg max-h-[min(90dvh,720px)] bg-white rounded-2xl shadow-xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="shrink-0 border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-3 bg-white">
            <div>
              <h2 id="about-dialog-title" className="text-lg font-bold text-green-700">
                关于快乐制造局
              </h2>
              <p className="text-sm text-gray-500 mt-1">使用说明与权限</p>
            </div>
            <button
              type="button"
              className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="关闭"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5 space-y-5 text-sm text-gray-700 leading-relaxed">
            <p>{ABOUT_INTRO}</p>

            {ABOUT_SECTIONS.map((section) => (
              <section key={section.title}>
                <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
                <ul className="space-y-1.5 list-disc pl-5 text-gray-600">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>,
      document.body,
    )

  return (
    <>
      <button
        type="button"
        className={iconButtonClass}
        aria-label="关于快乐制造局"
        title="关于"
        onClick={() => setOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <circle cx="12" cy="8" r="0.75" fill="currentColor" stroke="none" />
        </svg>
      </button>
      {mounted ? modal : null}
    </>
  )
}
