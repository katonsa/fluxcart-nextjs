"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { OrderStatusBadge } from "@/components/order-status-badge"
import type { AdminOrderSummary, ApiResponse } from "@/lib/types/api"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json() as Promise<ApiResponse<AdminOrderSummary[]>>)
      .then((res) => {
        if (res.success) setOrders(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground">Order ID</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Customer</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Date</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Total</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y relative">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">Loading orders...</td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{order.user.name}</p>
                    <p className="text-xs text-muted-foreground">{order.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">${Number(order.totalAmount).toFixed(2)}</td>
                  <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-primary font-medium hover:underline">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
