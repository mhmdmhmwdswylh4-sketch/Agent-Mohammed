import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "إنشاء حساب",
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 text-center lg:text-right">
        <h2 className="font-heading text-3xl font-bold text-foreground">إنشاء حساب جديد</h2>
        <p className="text-muted-foreground">انضم إلى Mx AI وابدأ رحلتك</p>
      </header>
      <RegisterForm />
    </div>
  )
}
