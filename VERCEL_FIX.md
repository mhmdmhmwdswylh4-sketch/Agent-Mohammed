# إصلاح الموقع على Vercel

## المشكلة الحالية
الموقع على https://mx-ai-platform.vercel.app/ يعيد **HTTP 404** بينما البناء المحلي يعمل بشكل صحيح (307 redirect إلى /login).

## السبب
الموقع المنشور قديم ولم يُحدّث مع آخر commits.

## الحل — 3 طرق

### الطريقة 1: إعادة نشر يدوية من Vercel Dashboard (الأسهل)

1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروع `Agent-Mohammed`
3. انقر على **Deployments** tab
4. ابحث عن آخر deployment
5. انقر على **Redeploy** أو **Deploy** button
6. انتظر 2-3 دقائق حتى ينتهي البناء
7. زيارة https://mx-ai-platform.vercel.app/ — يجب أن يعيد التوجيه إلى /login الآن

---

### الطريقة 2: إعادة نشر عبر GitHub (تلقائياً)

إذا كان Vercel متصلاً بـ GitHub:

1. اذهب إلى GitHub: https://github.com/mhmdmhmwdswylh4-sketch/Agent-Mohammed
2. انقر على **Commits** في branch `main` أو `v0/mhmdmhmwdswylh4-8957-a95ce233`
3. تأكد من أن آخر commit يحتوي على الملفات المحدثة
4. Vercel سيُشغّل deployment تلقائياً على أي push إلى GitHub

---

### الطريقة 3: إعادة نشر عبر Vercel CLI (للمطورين)

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## تحقق من النتيجة

```bash
# يجب أن ترى 307 redirect إلى /login
curl -I https://mx-ai-platform.vercel.app/

# أو انقر على الرابط:
# https://mx-ai-platform.vercel.app/login
```

---

## متغيرات البيئة المطلوبة

تأكد من أن جميع المتغيرات التالية معرّفة في **Vercel Dashboard → Settings → Environment Variables**:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
SESSION_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NVIDIA_API_KEY (optional for Phase 2+)
UPSTASH_REDIS_REST_URL (optional for Phase 7)
UPSTASH_REDIS_REST_TOKEN (optional for Phase 7)
```

---

## حالة البناء الحالية

✅ البناء المحلي نجح (322 routes معرّفة)
✅ جميع الملفات مدفوعة إلى GitHub
❌ الموقع على Vercel يحتاج إعادة نشر

الحل هو إعادة نشر واحدة فقط!
