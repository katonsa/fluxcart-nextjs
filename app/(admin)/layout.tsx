"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag02Icon,
  GridIcon,
  DeliveryBox01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const sidebarLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: GridIcon,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: ShoppingBag02Icon,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: DeliveryBox01Icon,
  },
]

function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-svh w-64 flex-col border-r border-border/40 bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/admin" className="text-lg font-bold tracking-tight">
          Flux<span className="text-primary">Cart</span>
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Admin
          </span>
        </Link>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href))

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <HugeiconsIcon icon={link.icon} size={18} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-4">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/">← Back to Store</Link>
        </Button>
      </div>
    </aside>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh">
      <AdminSidebar />
      <div className="flex-1">
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
