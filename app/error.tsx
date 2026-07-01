'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">خطأ 500</h1>
            <p className="text-muted-foreground mb-6">
              حدث خطأ غير متوقع. تحقق من متغيرات البيئة (Firebase, Supabase, NVIDIA_API_KEY).
            </p>
            <details className="mt-8 text-left bg-muted p-4 rounded mb-6 max-w-md mx-auto">
              <summary className="cursor-pointer font-semibold">التفاصيل</summary>
              <pre className="mt-2 text-xs overflow-auto">{error.message}</pre>
            </details>
            <button
              onClick={reset}
              className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              حاول مرة أخرى
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
