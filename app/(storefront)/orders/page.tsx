"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { OrderStatusBadge } from "@/components/order-status-badge"

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading your orders...</div>

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Order History</h1>
      
      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed py-24 text-center bg-card">
           <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
           <Button className="mt-4" asChild><Link href="/products">Start Shopping</Link></Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
             <div key={order.id} className="rounded-xl border bg-card overflow-hidden shadow-sm">
               <div className="bg-muted/50 p-4 sm:flex sm:items-center sm:justify-between border-b">
                  <div className="flex gap-8 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-1">Date</p>
                      <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-1">Total</p>
                      <p className="font-medium">${Number(order.totalAmount).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0">
                     <Button variant="outline" size="sm" asChild>
                       <Link href={`/orders/${order.id}`}>View Details</Link>
                     </Button>
                  </div>
               </div>
               
               <div className="p-6">
                 <div className="mb-4 flex items-center justify-between">
                   <h3 className="font-semibold text-lg text-foreground">Order #{order.id.slice(-8).toUpperCase()}</h3>
                   <OrderStatusBadge status={order.status} />
                 </div>
                 
                 <div className="flex -space-x-4">
                   {order.items.slice(0, 5).map((item: any) => (
                     item.productImage ? (
                       /* eslint-disable-next-line @next/next/no-img-element */
                       <img key={item.id} src={item.productImage} alt={item.productName} className="h-12 w-12 rounded-full border-2 border-background bg-muted object-cover" />
                     ) : (
                       <div key={item.id} className="h-12 w-12 rounded-full border-2 border-background bg-muted" />
                     )
                   ))}
                   {order.items.length > 5 && (
                     <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-secondary text-xs font-medium z-10">
                       +{order.items.length - 5}
                     </div>
                   )}
                 </div>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  )
}
