'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Profile {
  id: string
  email: string
  displayName?: string
  photoUrl?: string
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const res = await fetch('/api/account/profile')
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data: Profile = await res.json()
      setProfile(data)
      setDisplayName(data.displayName || '')
      setPhotoUrl(data.photoUrl || '')
    } catch (err) {
      toast.error('فشل تحميل الملف الشخصي')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!displayName.trim()) {
      toast.error('يرجى إدخال الاسم')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, photoUrl: photoUrl || undefined }),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      toast.success('تم تحديث الملف الشخصي بنجاح')
      await fetchProfile()
    } catch (err) {
      toast.error('فشل تحديث الملف الشخصي')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Info Card */}
      <Card className="lg:col-span-2 p-6 space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="size-20">
            <AvatarImage src={photoUrl || undefined} alt={displayName} />
            <AvatarFallback>{displayName?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
            <p className="font-mono text-foreground">{profile?.email}</p>
            <p className="text-xs text-muted-foreground mt-2">
              عضو منذ {new Date(profile?.createdAt || '').toLocaleDateString('ar-SA')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="displayName">الاسم</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="اسمك الكامل"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="photoUrl">رابط الصورة</Label>
            <Input
              id="photoUrl"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              type="url"
              className="mt-2"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">إحصائيات</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المحادثات</span>
            <span className="font-semibold">--</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">الرسائل</span>
            <span className="font-semibold">--</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">الاستخدام</span>
            <span className="font-semibold">--</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
