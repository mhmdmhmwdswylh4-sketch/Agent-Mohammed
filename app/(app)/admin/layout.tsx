import { getCurrentUser } from '@/lib/auth/current-user'
import { getContainer } from '@/lib/container'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const container = getContainer()
  const adminService = container.getAdminService()
  const isAdmin = await adminService.isAdmin(user.id)

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
