'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

interface Props {
  onFile: (file: File) => void
  parsing?: boolean
  hint?: string
  className?: string
}

export function ImageUploadZone({ onFile, parsing = false, hint, className = '' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const zoneRef = useRef<HTMLLabelElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const processFile = useCallback((file: File | null | undefined) => {
    if (!file) return
    if (!ACCEPT.includes(file.type)) {
      alert('仅支持 JPG、PNG、WebP 格式')
      return
    }
    if (file.size > MAX_BYTES) {
      alert('图片最大 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
    onFile(file)
  }, [onFile])

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          processFile(item.getAsFile())
          return
        }
      }
    }

    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [processFile])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files[0])
  }

  return (
    <label
      ref={zoneRef}
      tabIndex={0}
      className={`block border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors min-h-[140px] flex flex-col items-center justify-center outline-none focus:border-green-400 ${
        dragOver ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-400'
      } ${className}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(',')}
        className="hidden"
        onChange={(e) => processFile(e.target.files?.[0])}
      />
      {preview ? (
        <div className="w-full p-4 flex flex-col items-center gap-2">
          <img src={preview} alt="预览" className="max-h-24 rounded-lg object-contain" />
          <p className="text-xs text-gray-500">
            {parsing ? '正在识别...' : '点击或粘贴可更换图片'}
          </p>
        </div>
      ) : (
        <div className="p-8">
          <p className="text-gray-500">拖拽、点击或 Ctrl+V 粘贴截图 / 海报</p>
          <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG、WebP，最大 5MB</p>
        </div>
      )}
      {hint && <p className="text-xs text-amber-600 px-4 pb-3">{hint}</p>}
    </label>
  )
}
