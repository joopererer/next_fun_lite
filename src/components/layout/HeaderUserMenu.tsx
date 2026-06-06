import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser } from '../../lib/user'

interface Props {
  onEditProfile: () => void
}

export function HeaderUserMenu({ onEditProfile }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const user = getUser()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!user) {
    return (
      <button
        type="button"
        onClick={onEditProfile}
        className="text-sm text-green-700 font-medium px-3 py-1.5 rounded-lg hover:bg-green-50"
      >
        你是？
      </button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-sm text-green-700 font-medium px-3 py-1.5 rounded-lg hover:bg-green-50"
      >
        你好，{user.name} ▾
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px] z-50">
          <button
            type="button"
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setOpen(false)
              onEditProfile()
            }}
          >
            修改信息
          </button>
          <button
            type="button"
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setOpen(false)
              navigate('/my')
            }}
          >
            我的报名
          </button>
        </div>
      )}
    </div>
  )
}
