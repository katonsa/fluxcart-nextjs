import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Image01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"

import type { DecimalLike } from "@/lib/types/api"

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: DecimalLike
    stock: number
    imageUrls: string[]
    category?: {
      name: string
    } | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0
  const imageUrl = product.imageUrls?.[0]

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${isOutOfStock ? 'opacity-75' : ''}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted/50 flex items-center justify-center">
        {imageUrl ? (
           /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <HugeiconsIcon icon={Image01Icon} size={48} className="text-muted-foreground/30" />
        )}
        
        {isOutOfStock && (
          <div className="absolute top-3 left-3">
             <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            {product.category.name}
          </p>
        )}
        <h3 className="font-semibold tracking-tight line-clamp-1">{product.name}</h3>
        <p className="mt-auto pt-3 font-medium">
          ${Number(product.price).toFixed(2)}
        </p>
      </div>
    </Link>
  )
}
