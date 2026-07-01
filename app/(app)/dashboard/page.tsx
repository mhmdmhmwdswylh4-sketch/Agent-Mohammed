import type { Metadata } from "next"
import { MessageSquare, Sparkles, Clock, KeyRound } from "lucide-react"
import { requireUser } from "@/lib/auth/current-user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "لوحة التحكم",
}

const stats = [
  { icon: MessageSquare, label: "المحادثات", value: "0", hint: "ابدأ محادثتك الأولى" },
  { icon: Sparkles, label: "النموذج الافتراضي", value: "NIM", hint: "NVIDIA NIM" },
  { icon: Clock, label: "آخر نشاط", value: "الآن", hint: "جلسة نشطة" },
  { icon: KeyRound, label: "مفاتيح API", value: "0", hint: "أضف مفتاحك" },
]

export default async function DashboardPage() {
  const user = await requireUser()
  const firstName = user.displayName?.split(" ")[0] ?? "بك"

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          مرحباً، {firstName}
        </h1>
        <p className="text-muted-foreground">
          هذه لوحة تحكم Mx AI. اكتملت البنية الأساسية والمصادقة — الميزات التالية قادمة في المراحل القادمة.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <span className="font-heading text-2xl font-bold text-foreground">
                {s.value}
              </span>
              <span className="text-xs text-muted-foreground">{s.hint}</span>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">حالة المشروع</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <StatusRow label="البنية المعمارية (Clean Architecture + DI)" done />
          <StatusRow label="قاعدة البيانات (Supabase + Drizzle، 10 جداول)" done />
          <StatusRow label="المصادقة (Firebase Auth + جلسات مشفّرة)" done />
          <StatusRow label="الحماية (Middleware + Rate Limiting)" done />
          <StatusRow label="طبقة الذكاء الاصطناعي (NVIDIA NIM)" />
          <StatusRow label="واجهة المحادثة" />
        </CardContent>
      </Card>
    </div>
  )
}

function StatusRow({ label, done = false }: { label: string; done?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3">
      <span className="text-foreground">{label}</span>
      <span
        className={
          done
            ? "rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary"
            : "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
        }
      >
        {done ? "مكتمل" : "قادم"}
      </span>
    </div>
  )
}
