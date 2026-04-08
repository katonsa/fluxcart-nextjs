"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/hooks/use-cart"

interface AddToCartButtonProps {
  productId: string
  disabled?: boolean
  stock: number
}

export function AddToCartButton({ productId, disabled, stock }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { addItem } = useCart()

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      await addItem(productId, 1)
      toast.success("Added to cart")
      router.refresh() // Refreshes server components to show latest cart state if exposed
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
