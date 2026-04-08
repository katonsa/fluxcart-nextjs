"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { AddressView, ApiResponse, CartView, OrderDetails } from "@/lib/types/api"

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartView | null>(null)
  const [addresses, setAddresses] = useState<AddressView[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadCheckout = async () => {
      try {
        const [cartRes, addressesRes] = await Promise.all([
          fetch("/api/cart").then((res) => res.json() as Promise<ApiResponse<CartView>>),
          fetch("/api/users/me/addresses").then((res) => res.json() as Promise<ApiResponse<AddressView[]>>),
        ])

        if (cartRes.success) {
          setCart(cartRes.data)
        }

        if (addressesRes.success) {
          setAddresses(addressesRes.data)
          const defaultAddress = addressesRes.data.find((address) => address.isDefault)
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id)
          } else if (addressesRes.data.length > 0) {
            setSelectedAddressId(addressesRes.data[0].id)
          }
        }
      } catch {
        toast.error("Failed to load checkout data")
      } finally {
        setLoading(false)
      }
    }

    void loadCheckout()
  }, [])

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address")
      return
    }
    if (!cart?.items?.length) {
      toast.error("Cart is empty")
      return
    }
    
    setSubmitting(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: selectedAddressId })
      })
      const data = (await res.json()) as ApiResponse<OrderDetails>
      if (data.success) {
        toast.success("Order placed successfully!")
        router.push(`/orders/${data.data.id}`)
      } else {
        toast.error(data.message || "Failed to place order")
      }
    } catch {
      toast.error("Error placing order")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading checkout...</div>

  if (!cart?.items?.length) {
    return (
      <div className="p-12 text-center">
         <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
         <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
      </div>
    )
  }

  const total = cart.items.reduce((acc, item) => acc + item.quantity * Number(item.product.price), 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-10">Checkout</h1>
      
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
           <div className="rounded-xl border bg-card p-6 shadow-sm">
             <h2 className="text-xl font-semibold mb-4 border-b pb-4">Shipping Address</h2>
             {addresses.length === 0 ? (
                <div>
                   <p className="text-muted-foreground mb-4">You have no saved addresses.</p>
                   <Button onClick={() => router.push("/account/addresses")}>Add Address</Button>
                </div>
             ) : (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-accent'}`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                       <p className="font-medium text-foreground">{addr.fullName}</p>
                       <p className="text-sm text-muted-foreground">{addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}</p>
                    </div>
                  ))}
                </div>
             )}
           </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-semibold mb-4 border-b pb-4">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
               {cart.items.map((item) => (
                 <div key={item.id} className="flex justify-between text-sm">
                   <span className="text-muted-foreground line-clamp-1 flex-1 pr-4">{item.quantity}x {item.product.name}</span>
                   <span className="font-medium flex-shrink-0">${(item.quantity * Number(item.product.price)).toFixed(2)}</span>
                 </div>
               ))}
            </div>
            
            <div className="border-t pt-4 flex justify-between font-bold text-lg mb-6 text-foreground">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={submitting || addresses.length === 0}>
              {submitting ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
