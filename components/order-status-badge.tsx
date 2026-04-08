import { Badge } from "@/components/ui/badge"

const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pending", variant: "outline" },
  PROCESSING: { label: "Processing", variant: "secondary" },
  SHIPPED: { label: "Shipped", variant: "default" },
  DELIVERED: { label: "Delivered", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "destructive" },
}

export function OrderStatusBadge({ status }: { status: string }) {
  const config = statusMap[status] || { label: status, variant: "outline" }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
