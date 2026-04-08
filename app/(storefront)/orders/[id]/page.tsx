"use client"
import { useEffect, useEffectEvent, useState, use } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { toast } from "sonner"
import type { ApiResponse, OrderDetails } from "@/lib/types/api"

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const fetchOrder = useEffectEvent(async () => {
    try {
      const res = await fetch(`/api/orders/${id}`)
      const data = (await res.json()) as ApiResponse<OrderDetails>
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

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, { method: "PATCH" })
      const data = (await res.json()) as ApiResponse<OrderDetails>
      if (data.success) {
        setOrder(data.data)
        setIsCancelDialogOpen(false)
        toast.success("Order cancelled")
      } else {
        toast.error(data.message || "Failed to cancel")
      }
    } catch {
      toast.error("Error cancelling order")
    } finally {
      setIsCancelling(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading order details...</div>
  if (!order) return <div className="p-12 text-center">Order not found</div>

  const canCancel = order.status === "PENDING"

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
         <div>
           <Link href="/orders" className="text-sm text-primary hover:underline font-medium mb-4 block">&larr; Back to Orders</Link>
           <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(-8).toUpperCase()}</h1>
           <div className="mt-3 flex items-center gap-3">
             <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
             <OrderStatusBadge status={order.status} />
           </div>
         </div>
         {canCancel && (
           <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
             <AlertDialogTrigger asChild>
               <Button variant="destructive">Cancel Order</Button>
             </AlertDialogTrigger>
             <AlertDialogContent>
               <AlertDialogHeader>
                 <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                 <AlertDialogDescription>
                   This action cannot be undone. Your order will be marked as cancelled immediately.
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel disabled={isCancelling}>Keep Order</AlertDialogCancel>
                 <AlertDialogAction
                   variant="destructive"
                   disabled={isCancelling}
                   onClick={handleCancel}
                 >
                   {isCancelling ? "Cancelling..." : "Yes, Cancel Order"}
                 </AlertDialogAction>
               </AlertDialogFooter>
             </AlertDialogContent>
           </AlertDialog>
         )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-12">
         <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
               <h2 className="text-lg font-semibold border-b pb-4 mb-4">Items Ordered</h2>
               <div className="space-y-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-20 w-20 flex-shrink-0 bg-muted rounded-md border flex items-center justify-center overflow-hidden">
                        {item.productImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="flex flex-1 justify-between">
                         <div>
                           <h3 className="font-medium text-foreground">{item.productName}</h3>
                           <p className="mt-1 text-sm text-muted-foreground">Qty: {item.quantity}</p>
                         </div>
                         <p className="font-medium">${Number(item.unitPrice).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
         
         <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
               <h2 className="text-lg font-semibold border-b pb-4 mb-4">Order Summary</h2>
               <div className="flex justify-between font-bold text-lg text-foreground">
                 <span>Total</span>
                 <span>${Number(order.totalAmount).toFixed(2)}</span>
               </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
               <h2 className="text-lg font-semibold border-b pb-4 mb-4">Shipping Address</h2>
               {order.address ? (
                  <div className="text-sm">
                     <p className="font-medium text-foreground">{order.address.fullName}</p>
                     <p className="mt-1 text-muted-foreground">{order.address.addressLine1}</p>
                     <p className="text-muted-foreground">{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                  </div>
               ) : (
                  <p className="text-sm text-muted-foreground">Address not available</p>
               )}
            </div>
         </div>
      </div>
    </div>
  )
}
