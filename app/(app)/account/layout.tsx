import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الحساب | Mx AI',
  description: 'إدارة ملفك الشخصي والإعدادات',
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">إعدادات الحساب</h1>
        <p className="mt-2 text-muted-foreground">أدر ملفك الشخصي، الإعدادات، والأمان</p>
      </div>
      {children}
    </div>
  )
}
