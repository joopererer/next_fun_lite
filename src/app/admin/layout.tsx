'use client'

import { useEffect } from 'react'
import { AdminGate } from '@/src/components/admin/AdminGate'
import { clearAdminPassword } from '@/src/lib/api'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => () => clearAdminPassword(), [])

  return <AdminGate>{children}</AdminGate>
}
