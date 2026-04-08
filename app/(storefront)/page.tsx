import Link from "next/link"
import { Button } from "@/components/ui/button"
import { categoryService } from "@/lib/modules/categories/category.service"
import { CategoryCard } from "@/components/category-card"
import type { CategorySummary } from "@/lib/types/api"

export default async function HomePage() {
  const categories = await categoryService.list()
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary uppercase">
              Portfolio Demo
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Shop smarter with{" "}
              <span className="text-primary">FluxCart</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              A production-grade e-commerce backend built with Next.js, Prisma,
              Redis, and TypeScript. Featuring RBAC, atomic transactions, and
              Redis caching.
            </p>
            <div className="mt-8 flex gap-4">
              <Button size="lg" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/admin">Admin Panel</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute -top-24 right-0 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </section>

      {/* Categories Section — placeholder until categories API is wired */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Shop by Category
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse our curated collections
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">View all →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((category: CategorySummary) => (
            <CategoryCard key={category.id} category={category} />
          ))}
          {categories.length === 0 && (
            <p className="col-span-full text-muted-foreground">Detailed categories will appear here once added in admin.</p>
          )}
        </div>
      </section>
    </div>
  )
}
