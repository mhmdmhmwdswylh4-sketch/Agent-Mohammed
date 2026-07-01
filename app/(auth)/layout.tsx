import type { ReactNode } from "react"
import { Sparkles, ShieldCheck, Zap } from "lucide-react"
import { Logo } from "@/components/brand/logo"

const highlights = [
  { icon: Sparkles, title: "نماذج NVIDIA NIM", desc: "استدلال فائق السرعة بجودة عالية" },
  { icon: ShieldCheck, title: "أمان على مستوى المؤسسات", desc: "جلسات مشفّرة وحماية متعددة الطبقات" },
  { icon: Zap, title: "تجربة عربية أصيلة", desc: "واجهة RTL كاملة ومصمّمة بعناية" },
]

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-sidebar lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.8 0.13 85 / 0.14), transparent 45%), radial-gradient(circle at 80% 70%, oklch(0.8 0.13 85 / 0.08), transparent 40%)",
          }}
        />
        <Logo size="lg" className="relative" />

        <div className="relative flex flex-col gap-8">
          <h1 className="text-balance font-heading text-4xl font-bold leading-tight text-foreground">
            منصّة الذكاء الاصطناعي
            <br />
            <span className="text-primary">الأكثر احترافاً</span> بالعربية
          </h1>
          <ul className="flex flex-col gap-5">
            {highlights.map((h) => (
              <li key={h.title} className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <h.icon className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">{h.title}</span>
                  <span className="text-sm text-muted-foreground">{h.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-muted-foreground">
          © {new Date().getFullYear()} Mx AI. جميع الحقوق محفوظة.
        </p>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo size="md" />
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}
