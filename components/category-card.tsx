import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Image01Icon } from "@hugeicons/core-free-icons"

interface CategoryCardProps {
  category: {
    name: string
    slug: string
    description?: string | null
    imageUrl?: string | null
    _count?: { products: number }
  }
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/50 flex items-center justify-center">
        {category.imageUrl ? (
           /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <HugeiconsIcon icon={Image01Icon} size={48} className="text-muted-foreground/30" />
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold tracking-tight">{category.name}</h3>
        {category.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
        )}
        {category._count !== undefined && (
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            {category._count.products} {category._count.products === 1 ? "Product" : "Products"}
          </p>
        )}
      </div>
    </Link>
  )
}
