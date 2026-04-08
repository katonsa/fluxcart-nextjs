"use client"
import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  MoneyBag02Icon, 
  ShoppingCart01Icon, 
  UserGroupIcon, 
  PackageIcon 
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { OrderStatusBadge } from "@/components/order-status-badge"

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading dashboard...</div>
  if (!data) return <div className="p-8">Failed to load stats.</div>

  const { stats, recentOrders } = data

  const statCards = [
    { name: "Total Revenue", value: `$${Number(stats.revenue).toFixed(2)}`, icon: MoneyBag02Icon, color: "text-green-500 bg-green-500/10" },
    { name: "Orders", value: stats.orders, icon: ShoppingCart01Icon, color: "text-blue-500 bg-blue-500/10" },
    { name: "Customers", value: stats.users, icon: UserGroupIcon, color: "text-purple-500 bg-purple-500/10" },
    { name: "Products", value: stats.products, icon: PackageIcon, color: "text-orange-500 bg-orange-500/10" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome to your store's control panel.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
               <div className={`p-3 rounded-lg ${stat.color}`}>
                 <HugeiconsIcon icon={stat.icon} size={24} />
               </div>
               <div>
                 <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                 <h2 className="text-2xl font-bold">{stat.value}</h2>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground">Order ID</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Customer</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Date</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Amount</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
               {recentOrders.map((order: any) => (
                 <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                   <td className="px-6 py-4 font-medium">#{order.id.slice(-8).toUpperCase()}</td>
                   <td className="px-6 py-4">{order.user.name || order.user.email}</td>
                   <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                   <td className="px-6 py-4 font-medium">${Number(order.totalAmount).toFixed(2)}</td>
                   <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                 </tr>
               ))}
               {recentOrders.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No recent orders found.</td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
