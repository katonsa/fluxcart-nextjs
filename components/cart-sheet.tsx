"use client"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingCart01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { ApiResponse, CartView } from "@/lib/types/api"
import { CART_UPDATED_EVENT, emitCartUpdated } from "@/lib/cart-events"

export function CartSheet() {
  const [open, setOpen] = useState(false)
  const [cart, setCart] = useState<CartView | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchCart = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cart")
      const data = (await res.json()) as ApiResponse<CartView>
      if (data.success) {
        setCart(data.data)
      }
    } catch {
       // Silent error for cart auto-fetch
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      void fetchCart()
    }
  }, [open])

  useEffect(() => {
    const handleCartUpdated = () => {
      void fetchCart()
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated)
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated)
    }
  }, [])

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    try {
      const res = await fetch(`/api/cart/items/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      })
      const data = (await res.json()) as ApiResponse<CartView>
      if (data.success) {
        setCart(data.data)
        emitCartUpdated()
      }
      else toast.error(data.message || "Failed to update quantity")
    } catch {
      toast.error("Error updating cart")
    }
  }

  const removeItem = async (productId: string) => {
    try {
      const res = await fetch(`/api/cart/items/${productId}`, { method: "DELETE" })
      const data = (await res.json()) as ApiResponse<CartView>
      if (data.success) {
        setCart(data.data)
        emitCartUpdated()
      }
    } catch {
      toast.error("Error removing item")
    }
  }

  const itemsCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0
  const total = cart?.items.reduce((acc, item) => acc + item.quantity * Number(item.product.price), 0) || 0

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <HugeiconsIcon icon={ShoppingCart01Icon} size={24} />
          {itemsCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
              {itemsCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart ({itemsCount})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {loading && !cart ? (
            <div className="flex h-full items-center justify-center">Loading...</div>
          ) : (cart?.items.length ?? 0) > 0 ? (
            <div className="space-y-6">
              {cart!.items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                    {item.product.imageUrls?.[0] ? (
                       /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.product.imageUrls[0]} alt={item.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-muted-foreground">No image</span>
                    )}
                  </div>
                  
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm line-clamp-2">{item.product.name}</h3>
                      <p className="ml-4 font-medium text-sm">${Number(item.product.price).toFixed(2)}</p>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</Button>
                        <span className="w-4 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</Button>
                      </div>
                      
                      <button type="button" onClick={() => removeItem(item.productId)} className="font-medium text-destructive hover:underline text-xs">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <HugeiconsIcon icon={ShoppingCart01Icon} size={48} className="text-muted-foreground opacity-50" />
              <h3 className="mt-4 font-semibold">Your cart is empty</h3>
              <p className="mt-2 text-sm text-muted-foreground">Looks like you haven&apos;t added anything to your cart yet.</p>
              <Button className="mt-6" variant="outline" onClick={() => setOpen(false)} asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          )}
        </div>

        {(cart?.items.length ?? 0) > 0 && (
          <div className="border-t pt-6 bg-background">
            <div className="flex justify-between text-base font-medium mb-1.5">
              <p>Subtotal</p>
              <p>${total.toFixed(2)}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Shipping and taxes calculated at checkout.</p>
            <Button className="w-full" size="lg" asChild onClick={() => setOpen(false)}>
              <Link href="/checkout">Go to Checkout</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
