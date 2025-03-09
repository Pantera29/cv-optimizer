"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"

export function LogoutButton() {
  const { signOut, isLoading } = useAuth()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={signOut}
      title="Cerrar sesión"
      disabled={isLoading}
    >
      <LogOut className="h-4 w-4" />
    </Button>
  )
} 