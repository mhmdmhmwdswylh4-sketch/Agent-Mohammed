"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Settings, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logout } from "@/lib/firebase/auth-client"

interface UserMenuProps {
  name: string | null
  email: string
  photoUrl: string | null
}

export function UserMenu({ name, email, photoUrl }: UserMenuProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const initials = (name || email)
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  async function handleLogout() {
    setBusy(true)
    try {
      await logout()
      toast.success("تم تسجيل الخروج")
      router.replace("/login")
      router.refresh()
    } catch {
      toast.error("تعذّر تسجيل الخروج")
      setBusy(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-9 border border-border">
          {photoUrl && <AvatarImage src={photoUrl} alt={name ?? email} />}
          <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate font-semibold">{name ?? "مستخدم"}</span>
          <span className="truncate text-xs font-normal text-muted-foreground" dir="ltr">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserIcon className="size-4" />
          الملف الشخصي
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Settings className="size-4" />
          الإعدادات
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={busy}
          onSelect={(e) => {
            e.preventDefault()
            void handleLogout()
          }}
        >
          <LogOut className="size-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
