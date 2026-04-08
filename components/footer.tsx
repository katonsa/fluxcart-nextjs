import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Flux<span className="text-primary">Cart</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A production-grade e-commerce platform built with Next.js,
              Prisma, and Redis.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Shop</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/products"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                All Products
              </Link>
              <Link
                href="/products?inStock=true"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                In Stock
              </Link>
            </nav>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Account</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/account"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Profile
              </Link>
              <Link
                href="/orders"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Orders
              </Link>
              <Link
                href="/account/addresses"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Addresses
              </Link>
            </nav>
          </div>

          {/* Legal / Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Info</h3>
            <nav className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">
                Demo project — not a real store
              </span>
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} FluxCart. Built as a portfolio project.
          </p>
        </div>
      </div>
    </footer>
  )
}
