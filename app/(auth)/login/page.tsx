import { Suspense } from "react"
import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "تسجيل الدخول",
}

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 text-center lg:text-right">
        <h2 className="font-heading text-3xl font-bold text-foreground">تسجيل الدخول</h2>
        <p className="text-muted-foreground">أهلاً بك مجدداً في Mx AI</p>
      </header>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
