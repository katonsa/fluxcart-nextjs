"use client"

import { useEffect, useEffectEvent, useState, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrderStatusBadge } from "@/components/order-status-badge"
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

function formatCurrency(value: string | number | { toString(): string }) {
  return `$${Number(value).toFixed(2)}`
}

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

  if (loading && !order) {
    return (
      <Card className="max-w-5xl">
        <CardHeader>
          <CardTitle>Loading order</CardTitle>
          <CardDescription>Fetching the latest order details for review.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!order) {
    return (
      <Card className="max-w-5xl">
        <CardHeader>
          <CardTitle>Order not found</CardTitle>
          <CardDescription>This order could not be loaded or no longer exists.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0)

  return (
    <div className="max-w-6xl space-y-6">
      <Card className="border-0 bg-gradient-to-br from-card via-card to-muted/40 ring-1 ring-foreground/5">
        <CardContent className="grid gap-6 pt-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-4">
            <Button asChild variant="ghost" size="sm" className="w-fit px-0 text-muted-foreground hover:bg-transparent">
              <Link href="/admin/orders">&larr; Back to Orders</Link>
            </Button>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">Manage Order #{order.id.slice(-8).toUpperCase()}</h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Review the order payload, customer information, and delivery details before updating fulfillment.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Created</p>
                <p className="mt-2 font-medium">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="rounded-3xl border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Items</p>
                <p className="mt-2 text-2xl font-semibold">{itemCount}</p>
              </div>
              <div className="rounded-3xl border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>
          </div>

          <Card size="sm" className="border border-border/70 bg-background/80 shadow-none">
            <CardHeader className="border-b">
              <CardTitle>Fulfillment</CardTitle>
              <CardDescription>Update the order status without leaving the detail view.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Current status</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Change status</p>
                <Select
                  value={order.status}
                  disabled={updating}
                  onValueChange={(value) => updateStatus(value as OrderStatus)}
                >
                  <SelectTrigger className="w-full justify-between rounded-2xl border border-border bg-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end">
                    {AVAILABLE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Changes are saved immediately after selection.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="border border-border/70 shadow-none">
          <CardHeader className="border-b">
            <CardTitle>Items</CardTitle>
            <CardDescription>{order.items.length} line items captured at checkout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="grid gap-4 rounded-3xl border border-border/70 bg-muted/20 p-4 sm:grid-cols-[72px_1fr_auto]"
              >
                <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl bg-muted">
                  {item.productImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">No Image</span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">Product ID: {item.productId}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.unitPrice)} each
                  </p>
                </div>
                <div className="space-y-1 text-left sm:text-right">
                  <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(Number(item.unitPrice) * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card size="sm" className="border border-border/70 shadow-none">
            <CardHeader className="border-b">
              <CardTitle>Customer</CardTitle>
              <CardDescription>Contact details associated with the order.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</p>
                <p className="mt-2 font-medium">{order.user.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</p>
                <p className="mt-2 font-medium">{order.user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card size="sm" className="border border-border/70 shadow-none">
            <CardHeader className="border-b">
              <CardTitle>Shipping</CardTitle>
              <CardDescription>Delivery destination captured at checkout.</CardDescription>
            </CardHeader>
            <CardContent>
              {order.address ? (
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">{order.address.fullName}</p>
                  <p className="text-muted-foreground">{order.address.phone}</p>
                  <div className="pt-2 text-muted-foreground">
                    <p>{order.address.addressLine1}</p>
                    {order.address.addressLine2 ? <p>{order.address.addressLine2}</p> : null}
                    <p>
                      {order.address.city}, {order.address.state} {order.address.postalCode}
                    </p>
                    <p className="font-medium text-foreground">{order.address.country}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No address info.</p>
              )}
            </CardContent>
          </Card>

          <Card size="sm" className="border border-border/70 shadow-none">
            <CardHeader className="border-b">
              <CardTitle>Financials</CardTitle>
              <CardDescription>Order total and customer-provided notes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total Amount</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(order.totalAmount)}</p>
              </div>
              {order.notes ? (
                <div className="rounded-3xl border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Customer Notes</p>
                  <p className="mt-2 text-sm text-foreground">{order.notes}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No customer notes provided.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
