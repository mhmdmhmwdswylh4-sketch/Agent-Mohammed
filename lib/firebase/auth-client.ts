"use client"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type UserCredential,
} from "firebase/auth"
import { appleProvider, getFirebaseAuth, googleProvider } from "./client"

/** Human-readable Arabic messages for common Firebase auth error codes. */
function mapFirebaseError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "البريد الإلكتروني أو كلمة المرور غير صحيحة"
    case "auth/email-already-in-use":
      return "هذا البريد الإلكتروني مُستخدَم بالفعل"
    case "auth/weak-password":
      return "كلمة المرور ضعيفة جداً"
    case "auth/too-many-requests":
      return "عدد كبير من المحاولات، حاول لاحقاً"
    case "auth/popup-closed-by-user":
      return "تم إغلاق نافذة تسجيل الدخول"
    case "auth/account-exists-with-different-credential":
      return "يوجد حساب بنفس البريد بطريقة دخول مختلفة"
    default:
      return "تعذّر إتمام العملية، حاول مجدداً"
  }
}

/** Post the freshly-minted Firebase ID token to the server to open a session. */
async function establishServerSession(
  cred: UserCredential,
  event: "login" | "register",
): Promise<void> {
  const idToken = await cred.user.getIdToken(true)
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, event }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error?.message ?? "تعذّر إنشاء الجلسة على الخادم")
  }
}

export async function registerWithEmail(
  displayName: string,
  email: string,
  password: string,
): Promise<void> {
  const auth = getFirebaseAuth()
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await establishServerSession(cred, "register")
  } catch (err) {
    throw new Error(mapFirebaseError((err as { code?: string }).code ?? ""))
  }
}

export async function loginWithEmail(email: string, password: string): Promise<void> {
  const auth = getFirebaseAuth()
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    await establishServerSession(cred, "login")
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code) throw new Error(mapFirebaseError(code))
    throw err
  }
}

export async function loginWithGoogle(): Promise<void> {
  const auth = getFirebaseAuth()
  try {
    const cred = await signInWithPopup(auth, googleProvider)
    await establishServerSession(cred, "login")
  } catch (err) {
    throw new Error(mapFirebaseError((err as { code?: string }).code ?? ""))
  }
}

export async function loginWithApple(): Promise<void> {
  const auth = getFirebaseAuth()
  try {
    const cred = await signInWithPopup(auth, appleProvider)
    await establishServerSession(cred, "login")
  } catch (err) {
    throw new Error(mapFirebaseError((err as { code?: string }).code ?? ""))
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(getFirebaseAuth())
  } catch {
    // ignore client sign-out failures; server session is the source of truth
  }
  await fetch("/api/auth/logout", { method: "POST" })
}
