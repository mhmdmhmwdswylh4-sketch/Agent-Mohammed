# دليل النشر على Vercel — MX AI Platform

## المشكلة الحالية

الموقع على `https://mx-ai-platform.vercel.app/` يعيد HTTP 500 error. السبب هو **متغيرات البيئة الناقصة**.

## الحل: إضافة متغيرات البيئة على Vercel

### متغيرات مطلوبة (REQUIRED):

#### 1. Firebase (المصادقة والتخزين)
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx@iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

#### 2. قاعدة البيانات (Supabase)
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

#### 3. الجلسات
```
SESSION_SECRET=احفظ قيمة عشوائية قوية (استخدم: openssl rand -base64 32)
```

#### 4. API المصادقة (اختياري)
```
NVIDIA_API_KEY=xxx (للمحادثات باستخدام NIM)
```

#### 5. Redis للـ Caching (اختياري)
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### خطوات الإضافة:

1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروع "mx-ai-platform"
3. اضغط على **Settings** (الإعدادات)
4. اضغط على **Environment Variables** (متغيرات البيئة)
5. أضف كل متغير من القائمة أعلاه
6. اضغط **Redeploy** لإعادة بناء الموقع

## معالجة الأخطاء الشاملة

البرنامج يتضمن:

- **Global Error Handler** (`app/error.tsx`): يعرض رسالة خطأ ودية مع التفاصيل
- **Environment Validation** (`lib/env.ts`): التحقق من المتغيرات المطلوبة
- **API Error Handling** (`lib/http/api-handler.ts`): معالجة موحدة للأخطاء

## الطور الإنتاجي

عند النشر على الإنتاج:

1. تأكد من جميع متغيرات البيئة مضبوطة
2. استخدم كلمات مرور قوية لـ SESSION_SECRET
3. فعّل HTTPS (Vercel تفعله افتراضياً)
4. راقب السجلات: https://vercel.com/dashboard/project-id/logs

## تفاصيل البناء

البناء الآخير نجح مع **20 route** و **middleware proxy**:

- صفحات عامة: `/`, `/login`, `/register`
- صفحات محمية: `/dashboard`, `/account/*`, `/admin`
- API routes: `/api/auth/*`, `/api/chat/*`, `/api/prompts/*`, `/api/admin/*`, `/api/account/*`

## المزايا المضافة في Phase 6-7

**Phase 6 — Prompt Management:**
- CRUD كامل للـ prompts (إنشاء، قراءة، تحديث، حذف)
- فئات (categories) قابلة للتخصيص
- نسخ الـ prompts
- نظام prompts النظام (system prompts)

**Phase 7 — Performance & Caching:**
- Redis caching عبر Upstash
- cache invalidation ذكية
- TTL configurable (3600 ثانية افتراضياً)
- دعم ISR و prerendering

## القادم

- Webhook integrations
- Advanced analytics
- Multi-language support
- Mobile app
