'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface Session {
  id: string
  userAgent?: string
  ipAddress?: string
  createdAt: string
  lastUsedAt: string
  expiresAt: string
}

export default function SecurityPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    try {
      const res = await fetch('/api/account/sessions')
      if (!res.ok) throw new Error('Failed to fetch sessions')
      const data = await res.json()
      setSessions(data.sessions || [])
    } catch (err) {
      toast.error('فشل تحميل الجلسات')
    } finally {
      setLoading(false)
    }
  }

  async function revokeSession(sessionId: string) {
    setRevoking(sessionId)
    try {
      const res = await fetch('/api/account/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      if (!res.ok) throw new Error('Failed to revoke session')
      toast.success('تم إنهاء الجلسة')
      await fetchSessions()
    } catch (err) {
      toast.error('فشل إنهاء الجلسة')
    } finally {
      setRevoking(null)
    }
  }

  async function deleteAccount() {
    if (!window.confirm('هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error('Failed to delete account')
      toast.success('تم حذف حسابك بنجاح')
      // Logout and redirect
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (err) {
      toast.error('فشل حذف الحساب')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  return (
    <div className="space-y-8">
      {/* Active Sessions */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">الجلسات النشطة</h3>
        <p className="text-sm text-muted-foreground">
          أدِر أجهزتك المتصلة بحسابك
        </p>

        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">لا توجد جلسات نشطة</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.userAgent || 'جهاز غير معروف'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    IP: {session.ipAddress || '--'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    آخر استخدام:{' '}
                    {new Date(session.lastUsedAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeSession(session.id)}
                  disabled={revoking === session.id}
                >
                  {revoking === session.id ? '...' : 'إنهاء'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 space-y-4 border-destructive/50 bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-destructive">منطقة الخطر</h3>
            <p className="text-sm text-muted-foreground mt-1">
              هذه الإجراءات لا يمكن التراجع عنها
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          onClick={deleteAccount}
          disabled={deleting}
          className="w-full"
        >
          {deleting ? 'جاري الحذف...' : 'حذف الحساب نهائياً'}
        </Button>
      </Card>
    </div>
  )
}
