"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Eye, EyeOff, Flag, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ReviewStatus } from "@/lib/types"

interface ReviewModerationButtonProps {
  reviewId: string
  currentStatus: ReviewStatus
}

export function ReviewModerationButton({
  reviewId,
  currentStatus,
}: ReviewModerationButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const updateStatus = async (newStatus: ReviewStatus) => {
    setLoading(true)

    const supabase = createClient()
    await supabase
      .from("reviews")
      .update({ status: newStatus })
      .eq("id", reviewId)

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
          Moderate
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus !== "visible" && (
          <DropdownMenuItem onClick={() => updateStatus("visible")}>
            <Eye className="mr-2 h-4 w-4 text-green-500" />
            Approve (Make Visible)
          </DropdownMenuItem>
        )}
        {currentStatus !== "hidden" && (
          <DropdownMenuItem onClick={() => updateStatus("hidden")}>
            <EyeOff className="mr-2 h-4 w-4" />
            Hide
          </DropdownMenuItem>
        )}
        {currentStatus !== "flagged" && (
          <DropdownMenuItem onClick={() => updateStatus("flagged")}>
            <Flag className="mr-2 h-4 w-4 text-yellow-500" />
            Flag for Review
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
