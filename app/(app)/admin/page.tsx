'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import QRCode from 'qrcode'

interface Stats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  recentLogs: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [mfaSetup, setMfaSetup] = useState<any>(null)
  const [mfaToken, setMfaToken] = useState('')
  const [ipList, setIpList] = useState<any[]>([])
  const [newIp, setNewIp] = useState('')

  useEffect(() => {
    fetchStats()
    fetchIpAllowlist()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setStats(data.stats)
    } catch (err) {
      toast.error('خطأ في جلب الإحصائيات')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchIpAllowlist = async () => {
    try {
      const res = await fetch('/api/admin/ip-allowlist')
      if (!res.ok) throw new Error('Failed to fetch IP allowlist')
      const data = await res.json()
      setIpList(data.ips)
    } catch (err) {
      toast.error('خطأ في جلب قائمة IP')
    }
  }

  const setupMfa = async () => {
    try {
      const res = await fetch('/api/admin/mfa/setup', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to setup MFA')
      const data = await res.json()

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(data.setup.qrCode)
      setMfaSetup({
        ...data.setup,
        qrCodeUrl: qrDataUrl,
      })
      toast.success('تم إعداد المصادقة الثنائية')
    } catch (err) {
      toast.error('خطأ في إعداد المصادقة الثنائية')
    }
  }

  const verifyMfa = async () => {
    try {
      const res = await fetch('/api/admin/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: mfaToken }),
      })
      if (!res.ok) throw new Error('Invalid MFA token')
      toast.success('تم تفعيل المصادقة الثنائية')
      setMfaSetup(null)
      setMfaToken('')
    } catch (err) {
      toast.error('رمز غير صحيح')
    }
  }

  const addIp = async () => {
    try {
      const res = await fetch('/api/admin/ip-allowlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipAddress: newIp }),
      })
      if (!res.ok) throw new Error('Failed to add IP')
      toast.success('تم إضافة عنوان IP')
      setNewIp('')
      fetchIpAllowlist()
    } catch (err) {
      toast.error('خطأ في إضافة عنوان IP')
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gold">لوحة الإدارة</h1>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
            <TabsTrigger value="mfa">المصادقة الثنائية</TabsTrigger>
            <TabsTrigger value="ip">قائمة IP</TabsTrigger>
            <TabsTrigger value="logs">السجلات</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground">جاري التحميل...</div>
            ) : stats ? (
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">إجمالي المستخدمين</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gold">{stats.totalUsers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">المستخدمون النشطون</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">{stats.activeUsers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">المستخدمون غير النشطين</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-500">{stats.inactiveUsers}</div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="mfa" className="space-y-4">
            {!mfaSetup ? (
              <Button onClick={setupMfa} className="w-full">
                إعداد المصادقة الثنائية
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>إعداد المصادقة الثنائية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mfaSetup.qrCodeUrl && (
                    <div className="flex justify-center">
                      <img src={mfaSetup.qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="mfaToken">أدخل الكود من التطبيق</Label>
                    <Input
                      id="mfaToken"
                      maxLength={6}
                      value={mfaToken}
                      onChange={(e) => setMfaToken(e.target.value)}
                      placeholder="000000"
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={verifyMfa} className="w-full">
                    تأكيد
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    <strong>رموز الاحتياطية:</strong>
                    <div className="font-mono text-xs mt-2">
                      {mfaSetup.backupCodes?.join('\n')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ip" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>قائمة عناوين IP المسموحة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newIp">أضف عنوان IP</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="newIp"
                      value={newIp}
                      onChange={(e) => setNewIp(e.target.value)}
                      placeholder="192.168.1.1"
                    />
                    <Button onClick={addIp}>إضافة</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {ipList.map((ip) => (
                    <div key={ip.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-mono">{ip.ipAddress}</div>
                        {ip.description && (
                          <div className="text-xs text-muted-foreground">{ip.description}</div>
                        )}
                      </div>
                      <span className={ip.active ? 'text-green-500' : 'text-red-500'}>
                        {ip.active ? 'نشط' : 'معطّل'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            {stats?.recentLogs && (
              <div className="space-y-2">
                {stats.recentLogs.map((log: any) => (
                  <Card key={log.id}>
                    <CardContent className="text-sm p-4">
                      <div className="font-mono text-xs">{log.action}</div>
                      <div className="text-muted-foreground mt-1">
                        {new Date(log.createdAt).toLocaleDateString('ar')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
