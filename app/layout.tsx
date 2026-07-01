import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cairo, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Mx AI — منصّة الذكاء الاصطناعي',
    template: '%s | Mx AI',
  },
  description:
    'Mx AI منصّة ذكاء اصطناعي عربية فائقة الاحتراف مبنية على نماذج NVIDIA NIM، مع محادثات ذكية وإدارة متقدّمة.',
  generator: 'v0.app',
  keywords: ['ذكاء اصطناعي', 'Mx AI', 'محادثة', 'NVIDIA NIM', 'AI'],
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#141821',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`dark ${cairo.variable} ${geistMono.variable}`}
    >
      <body className="bg-background font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
