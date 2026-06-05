import { useState } from 'react'
import { api, clearAdminPassword, getAdminPassword, setAdminPassword } from '../../lib/api'

interface Props {
  children: React.ReactNode
}

export function AdminGate({ children }: Props) {
  const [authed, setAuthed] = useState(!!getAdminPassword())
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  const handleLogin = async () => {
    if (!password.trim()) return
    setChecking(true)
    setError('')
    setAdminPassword(password.trim())
    try {
      await api.getActivities()
      setAuthed(true)
    } catch {
      clearAdminPassword()
      setError('密码错误')
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
