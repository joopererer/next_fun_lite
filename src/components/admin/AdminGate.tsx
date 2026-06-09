'use client'

import { useEffect, useState } from 'react'
import { ADMIN_AUTH_EXPIRED_EVENT, api, clearAdminPassword, setAdminPassword } from '../../lib/api'

interface Props {
  children: React.ReactNode
}

export function AdminGate({ children }: Props) {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const onExpired = () => {
      clearAdminPassword()
      setAuthed(false)
      setError('管理员密码无效或已过期，请重新输入')
    }
    window.addEventListener(ADMIN_AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(ADMIN_AUTH_EXPIRED_EVENT, onExpired)
  }, [])

  const handleLogin = async () => {
    if (!password.trim()) return
    setChecking(true)
    setError('')
    setAdminPassword(password.trim())
    try {
      await api.verifyAdmin()
      setAuthed(true)
      setPassword('')
    } catch (err) {
      clearAdminPassword()
      setError(err instanceof Error ? err.message : '密码错误')
    } finally {
      setChecking(false)
    }
  }

  if (authed) return <>{children}</>

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-bg p-4">
      <div className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-sm page-enter">
        <h2 className="text-xl font-bold mb-2 text-center">管理员登录</h2>
        <p className="text-sm text-gray-500 text-center mb-6">请输入管理员密码</p>
        <input
          type="password"
          className="input-field mb-3"
          placeholder="管理员密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button type="button" className="btn-primary w-full" onClick={handleLogin} disabled={checking}>
          {checking ? '验证中...' : '进入管理'}
        </button>
      </div>
    </div>
  )
}
