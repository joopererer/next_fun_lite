'use client'

import { useEffect, useState } from 'react'
import { ADMIN_AUTH_EXPIRED_EVENT, api, clearAdminPassword, setAdminPassword } from '../../lib/api'

interface Props {
  children: React.ReactNode
}

export function AdminGate({ children }: Props) {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
        <div className="relative mb-3">
          <input
            type={showPassword ? 'text' : 'password'}
            className="input-field w-full pr-11"
            placeholder="管理员密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? '隐藏密码' : '显示密码'}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
                <path d="M3 3l18 18" />
                <path d="M10.584 10.587a2 2 0 0 0 2.828 2.83" />
                <path d="M9.363 5.365A9.875 9.875 0 0 1 12 5c4.478 0 8.268 2.943 9.542 7-1.274 2.057-2.394 3.548-3.364 4.472M6.589 6.589C4.177 8.047 2.453 10.028 1.458 12c1.274 4.057 5.064 7 9.542 7 1.088 0 2.13-.18 3.09-.51" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button type="button" className="btn-primary w-full" onClick={handleLogin} disabled={checking}>
          {checking ? '验证中...' : '进入管理'}
        </button>
      </div>
    </div>
  )
}
