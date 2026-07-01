'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Settings {
  id: string
  userId: string
  theme: string
  language: string
  fontSize: string
  defaultModel?: string
  preferences: Record<string, any>
  createdAt: string
  updatedAt: string
}

const FONT_SIZES = [
  { value: 'small', label: 'صغير' },
  { value: 'medium', label: 'متوسط' },
  { value: 'large', label: 'كبير' },
]

const THEMES = [
  { value: 'dark', label: 'مظلم' },
  { value: 'light', label: 'فاتح' },
]

const LANGUAGES = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [theme, setTheme] = useState('dark')
  const [language, setLanguage] = useState('ar')
  const [fontSize, setFontSize] = useState('medium')
  const [defaultModel, setDefaultModel] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/account/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data: Settings = await res.json()
      setSettings(data)
      setTheme(data.theme)
      setLanguage(data.language)
      setFontSize(data.fontSize)
      setDefaultModel(data.defaultModel || '')
    } catch (err) {
      toast.error('فشل تحميل الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/account/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          language,
          fontSize,
          defaultModel: defaultModel || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to save settings')
      toast.success('تم حفظ الإعدادات بنجاح')
      await fetchSettings()
    } catch (err) {
      toast.error('فشل حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Appearance Settings */}
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">المظهر</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme">المظهر</Label>
              <Select value={theme || ''} onValueChange={(v) => setTheme(v || 'dark')}>
                <SelectTrigger id="theme" className="mt-2">
                  <SelectValue placeholder="اختر المظهر" />
                </SelectTrigger>
                <SelectContent>
                  {THEMES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fontSize">حجم الخط</Label>
              <Select value={fontSize || ''} onValueChange={(v) => setFontSize(v || 'medium')}>
                <SelectTrigger id="fontSize" className="mt-2">
                  <SelectValue placeholder="اختر الحجم" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">اللغة</Label>
              <Select value={language || ''} onValueChange={(v) => setLanguage(v || 'ar')}>
                <SelectTrigger id="language" className="mt-2">
                  <SelectValue placeholder="اختر اللغة" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Settings */}
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">الذكاء الاصطناعي</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="defaultModel">النموذج الافتراضي</Label>
              <Select value={defaultModel || ''} onValueChange={(v: string | null) => v && setDefaultModel(v)}>
                <SelectTrigger id="defaultModel" className="mt-2">
                  <SelectValue placeholder="اختر نموذجاً" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">بدون اختيار</SelectItem>
                  <SelectItem value="meta/llama-3.3-70b-instruct">
                    Llama 3.3 70B
                  </SelectItem>
                  <SelectItem value="meta/llama-2-70b-chat">
                    Llama 2 70B
                  </SelectItem>
                  <SelectItem value="deepseek-coder">
                    DeepSeek Coder
                  </SelectItem>
                  <SelectItem value="qwen/qwen2-coder-32b">
                    Qwen2 Coder
                  </SelectItem>
                  <SelectItem value="nvidia/nemotron-4-340b">
                    Nemotron 4 340B
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                يُستخدم عند إنشاء محادثات جديدة
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="lg:col-span-2">
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
          {saving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
        </Button>
      </div>
    </div>
  )
}
