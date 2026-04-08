"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"

export default function CartPage() {
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart")
      const data = await res.json()
      if (data.success) {
        setCart(data.data)
      }
    } catch {
       toast.error("Failed to load cart")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity })
      })
      const data = await res.json()
      if (data.success) setCart(data.data)
    } catch {
      toast.error("Error updating cart")
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) setCart(data.data)
    } catch {
      toast.error("Error removing item")
    }
  }

  if (loading) return <div className="p-12 pl-12 text-center text-muted-foreground">Loading your cart...</div>

  const itemsCount = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0
  const total = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity * Number(item.product.price), 0) || 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-10">Shopping Cart</h1>

      {cart?.items?.length > 0 ? (
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            {cart.items.map((item: any) => (
              <div key={item.id} className="flex gap-6 rounded-xl border bg-card p-6 shadow-sm">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                  {item.product.imageUrls?.[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.product.imageUrls[0]} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground">No image</span>
                  )}
                </div>
                
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </p>
                    </div>
                    <p className="font-semibold text-lg">${Number(item.product.price).toFixed(2)}</p>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                      <span className="w-6 text-center font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                    </div>
                    
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(item.id)}>
                      <HugeiconsIcon icon={Delete02Icon} size={20} />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold border-b pb-4 mb-4 text-foreground/90">Order Summary</h2>
              
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted-foreground">Subtotal ({itemsCount} items)</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted-foreground">Shipping estimate</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm mb-6">
                <span className="text-muted-foreground">Tax estimate</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              
              <div className="border-t pt-4 flex justify-between font-semibold text-lg mb-6">
                <span>Order Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <Button size="lg" className="w-full">
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed py-24 text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Ready to start shopping?</p>
          <Button size="lg" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
