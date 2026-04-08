import { notFound } from "next/navigation"
import { productService } from "@/lib/modules/products/product.service"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Image01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { AddToCartButton } from "@/components/add-to-cart-button"

type Params = Promise<{ slug: string }>

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params
  let product

  try {
    product = await productService.getBySlug(slug)
  } catch (e) {
    notFound()
  }

  const isOutOfStock = product.stock <= 0
  const imageUrl = product.imageUrls?.[0]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border/40 bg-muted/50 flex items-center justify-center">
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
             <HugeiconsIcon icon={Image01Icon} size={64} className="text-muted-foreground/30" />
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          {product.category && (
            <Link 
              href={`/products?category=${product.category.slug}`}
              className="mb-3 text-sm font-medium text-primary hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
          
          <div className="mt-4 flex items-center gap-4">
            <p className="text-3xl font-bold">${Number(product.price).toFixed(2)}</p>
            {isOutOfStock ? (
              <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
            ) : (
              <Badge variant="secondary" className="text-sm border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">In Stock ({product.stock})</Badge>
            )}
          </div>

          <div className="mt-8 flex gap-4">
             <AddToCartButton productId={product.id} stock={product.stock} />
          </div>

          <div className="mt-12">
            <h3 className="font-semibold text-lg border-b border-border/40 pb-3">Description</h3>
            <div className="mt-6 prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
              <p className="leading-relaxed">{product.description || "No description available."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
