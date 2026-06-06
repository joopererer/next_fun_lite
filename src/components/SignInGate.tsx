'use client'

import { SignInButton, useUser } from '@clerk/nextjs'

interface Props {
  children: React.ReactNode
  message?: string
}

export function SignInGate({ children, message = '请先登录后再继续' }: Props) {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) {
    return <div className="text-center text-gray-400 py-16">加载中...</div>
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
        <p className="text-gray-600 mb-4 text-center">{message}</p>
        <SignInButton mode="modal">
          <button type="button" className="btn-primary">登录 / 注册</button>
        </SignInButton>
      </div>
    )
  }

  return <>{children}</>
}
