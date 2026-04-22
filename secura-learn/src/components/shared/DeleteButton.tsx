"use client"

import { Button } from "@/components/ui/button"

interface DeleteButtonProps {
  confirmMessage?: string
  label?: string
  size?: "default" | "sm" | "lg" | "xs" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
}

/**
 * A submit button that shows a confirm dialog before submitting.
 * Must be placed inside a <form> element.
 */
export function DeleteButton({
  confirmMessage = "Are you sure you want to delete this? This cannot be undone.",
  label = "Delete",
  size = "sm",
}: DeleteButtonProps) {
  return (
    <Button
      type="submit"
      variant="destructive"
      size={size}
      onClick={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault()
        }
      }}
    >
      {label}
    </Button>
  )
}
