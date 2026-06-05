import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getUser } from '../../lib/user'
import { UserIdentityModal } from '../UserIdentityModal'

export function Header() {
  const [modalOpen, setModalOpen] = useState(false)
  const user = getUser()

  return (
    <>
      <header className="sticky top-0 z-40 bg-warm-bg/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="block">
            <h1 className="text-lg font-bold text-green-700">🎉 Next Fun Lite</h1>
            <p className="text-xs text-gray-500">Next Fun Club · 巴黎</p>
          </Link>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-sm text-green-700 font-medium px-3 py-1.5 rounded-lg hover:bg-green-50"
          >
            {user ? `你好，${user.name} ▾` : '你是？'}
          </button>
        </div>
      </header>
      <UserIdentityModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
