"use client"

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app"
import {
  GoogleAuthProvider,
  OAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)

let app: FirebaseApp | undefined
let authInstance: Auth | undefined

export function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase غير مُهيّأ. أضف متغيرات NEXT_PUBLIC_FIREBASE_* في إعدادات المشروع.",
    )
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  }
  if (!authInstance) {
    authInstance = getAuth(app)
    // Keep the user signed in across reloads on the client.
    void setPersistence(authInstance, browserLocalPersistence)
  }
  return authInstance
}

export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope("profile")
googleProvider.addScope("email")
googleProvider.setCustomParameters({
  prompt: "select_account",
})

export const appleProvider = new OAuthProvider("apple.com")
appleProvider.addScope("email")
appleProvider.addScope("name")
