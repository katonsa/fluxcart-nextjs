"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { emitCartUpdated } from "@/lib/cart-events"
import type { ApiResponse, CartView } from "@/lib/types/api"

interface AddToCartButtonProps {
  productId: string
  disabled?: boolean
  stock: number
}

export function AddToCartButton({ productId, disabled, stock }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      const data = (await res.json()) as ApiResponse<CartView>
      
      if (data.success) {
        toast.success("Added to cart")
        emitCartUpdated()
        router.refresh() // Refreshes server components to show latest cart state if exposed
      } else {
        toast.error(data.message || "Failed to add to cart")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      size="lg" 
      className="flex-1" 
      disabled={disabled || loading || stock <= 0}
      onClick={handleAddToCart}
    >
      {stock <= 0 ? "Out of Stock" : loading ? "Adding..." : "Add to Cart"}
    </Button>
  )
}
