"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Ban, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { StoreStatus } from "@/lib/types"

interface StoreStatusButtonProps {
  storeId: string
  currentStatus: StoreStatus
}

export function StoreStatusButton({ storeId, currentStatus }: StoreStatusButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const updateStatus = async (newStatus: StoreStatus) => {
    setLoading(true)

    const supabase = createClient()
    await supabase
      .from("stores")
      .update({ status: newStatus })
      .eq("id", storeId)

    setLoading(false)
    router.refresh()
  }

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Change Status
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {currentStatus !== "approved" && (
          <DropdownMenuItem onClick={() => updateStatus("approved")}>
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Approve
          </DropdownMenuItem>
        )}
        {currentStatus !== "pending" && (
          <DropdownMenuItem onClick={() => updateStatus("pending")}>
            <X className="mr-2 h-4 w-4" />
            Set to Pending
          </DropdownMenuItem>
        )}
        {currentStatus !== "suspended" && (
          <DropdownMenuItem onClick={() => updateStatus("suspended")}>
            <Ban className="mr-2 h-4 w-4 text-red-500" />
            Suspend
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
