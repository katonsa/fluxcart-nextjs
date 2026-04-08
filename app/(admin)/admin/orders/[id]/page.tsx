"use client"
import { useEffect, useEffectEvent, useState, use } from "react"
import Link from "next/link"
import { toast } from "sonner"
import type { AdminOrderDetails, ApiResponse } from "@/lib/types/api"
import type { OrderStatus } from "@/lib/generated/prisma/client"

const AVAILABLE_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<AdminOrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchOrder = useEffectEvent(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`)
      const data = (await res.json()) as ApiResponse<AdminOrderDetails>
      if (data.success) {
        setOrder(data.data)
      }
    } finally {
      setLoading(false)
    }
  })

  useEffect(() => {
    void fetchOrder()
  }, [id])

  const updateStatus = async (status: OrderStatus) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = (await res.json()) as ApiResponse<AdminOrderDetails>
      if (data.success) {
        setOrder(data.data)
        toast.success("Order status updated")
      } else {
        toast.error(data.message || "Failed to update status")
      }
    } catch {
      toast.error("Error updating order")
    } finally {
      setUpdating(false)
    }
  }

  if (loading && !order) return <div className="p-8">Loading order...</div>
  if (!order) return <div className="p-8">Order not found</div>

  return (
    <div className="space-y-8 max-w-5xl">
       <div className="flex items-center justify-between">
         <div>
           <Link href="/admin/orders" className="text-sm text-primary hover:underline font-medium mb-2 block">&larr; Back to Orders</Link>
           <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(-8).toUpperCase()}</h1>
           <p className="mt-1 text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
         </div>
         
         <div className="flex items-center gap-3 bg-muted p-2 rounded-lg border">
           <span className="text-sm font-medium px-2">Update Status:</span>
           <select 
             className="bg-background border rounded-md px-3 py-1.5 text-sm outline-none font-medium"
             value={order.status}
             disabled={updating}
             onChange={(e) => updateStatus(e.target.value as OrderStatus)}
           >
             {AVAILABLE_STATUSES.map(s => (
               <option key={s} value={s}>{s}</option>
             ))}
           </select>
         </div>
       </div>

       <div className="grid lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
           <div className="rounded-xl border bg-card p-6 shadow-sm">
             <h2 className="text-lg font-semibold border-b pb-4 mb-4">Items</h2>
             <div className="divide-y space-y-4">
                {order.items.map((item, i) => (
                  <div key={item.id} className={`flex gap-4 ${i > 0 && 'pt-4'}`}>
                    <div className="h-16 w-16 bg-muted rounded border overflow-hidden">
                       {item.productImage && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                       )}
                    </div>
                    <div className="flex-1 flex justify-between">
                       <div>
                         <p className="font-medium text-foreground">{item.productName}</p>
                         <p className="text-sm text-muted-foreground mt-1">ID: {item.productId}</p>
                       </div>
                       <div className="text-right">
                         <p className="font-medium text-foreground">${Number(item.unitPrice).toFixed(2)}</p>
                         <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
           </div>
         </div>

         <div className="space-y-6">
           <div className="rounded-xl border bg-card p-6 shadow-sm">
             <h2 className="text-lg font-semibold border-b pb-4 mb-4">Customer Details</h2>
             <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{order.user.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{order.user.email}</p>
                </div>
             </div>
           </div>

           <div className="rounded-xl border bg-card p-6 shadow-sm">
             <h2 className="text-lg font-semibold border-b pb-4 mb-4">Shipping Destination</h2>
             {order.address ? (
                <div className="space-y-1 text-sm">
                   <p className="font-medium">{order.address.fullName}</p>
                   <p className="text-muted-foreground">{order.address.phone}</p>
                   <p className="text-muted-foreground mt-2">{order.address.addressLine1}</p>
                   {order.address.addressLine2 && <p className="text-muted-foreground">{order.address.addressLine2}</p>}
                   <p className="text-muted-foreground">{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                   <p className="text-muted-foreground font-medium mt-1">{order.address.country}</p>
                </div>
             ) : (
                <p className="text-sm text-muted-foreground">No address info.</p>
             )}
           </div>

           <div className="rounded-xl border bg-card p-6 shadow-sm">
             <h2 className="text-lg font-semibold border-b pb-4 mb-4">Financials</h2>
             <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span>${Number(order.totalAmount).toFixed(2)}</span>
             </div>
             {order.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Customer Notes</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
             )}
           </div>
         </div>
       </div>
    </div>
  )
}
