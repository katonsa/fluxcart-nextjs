import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/lib/generated/prisma/client"

const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pending", variant: "outline" },
  CONFIRMED: { label: "Confirmed", variant: "secondary" },
  PROCESSING: { label: "Processing", variant: "secondary" },
  SHIPPED: { label: "Shipped", variant: "default" },
  DELIVERED: { label: "Delivered", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "destructive" },
}

export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  const config = statusMap[status] || { label: status, variant: "outline" }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
