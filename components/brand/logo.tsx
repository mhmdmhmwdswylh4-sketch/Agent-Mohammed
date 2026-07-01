import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: { box: "size-8", mark: "text-base", text: "text-lg" },
  md: { box: "size-10", mark: "text-lg", text: "text-xl" },
  lg: { box: "size-14", mark: "text-2xl", text: "text-3xl" },
}

/** Mx AI wordmark: gold monogram tile + Arabic-friendly wordmark. */
export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const s = sizeMap[size]
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-primary font-mono font-bold text-primary-foreground shadow-lg shadow-primary/20",
          s.box,
          s.mark,
        )}
        aria-hidden="true"
      >
        Mx
      </div>
      {showText && (
        <span className={cn("font-heading font-bold tracking-tight text-foreground", s.text)}>
          Mx <span className="text-primary">AI</span>
        </span>
      )}
    </div>
  )
}
