import { z } from "zod"

/** Shared password policy for client + server. */
export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
  .max(128, "كلمة المرور طويلة جداً")
  .regex(/[a-z]/, "يجب أن تحتوي على حرف صغير")
  .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير")
  .regex(/[0-9]/, "يجب أن تحتوي على رقم")

export const emailSchema = z
  .string()
  .min(1, "البريد الإلكتروني مطلوب")
  .email("صيغة البريد الإلكتروني غير صحيحة")

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(2, "الاسم يجب أن يكون حرفين على الأقل")
      .max(60, "الاسم طويل جداً"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "كلمة المرور مطلوبة"),
})

/** Server-side session-establishment payload: a verified Firebase ID token. */
export const sessionSchema = z.object({
  idToken: z.string().min(20, "رمز الدخول غير صالح"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SessionInput = z.infer<typeof sessionSchema>
