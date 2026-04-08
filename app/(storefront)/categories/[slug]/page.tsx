import { notFound } from "next/navigation"
import { categoryService } from "@/lib/modules/categories/category.service"
import { productService } from "@/lib/modules/products/product.service"
import { ProductCard } from "@/components/product-card"
import type { ProductSummary } from "@/lib/types/api"

type Params = Promise<{ slug: string }>

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params
  let category

  try {
    category = await categoryService.getBySlug(slug)
  } catch {
    notFound()
  }

  const { data: products } = await productService.list({ category: slug, limit: 20 })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-border/40 pb-8">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-lg text-muted-foreground">{category.description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.length > 0 ? (
          products.map((product: ProductSummary) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-muted-foreground">No products found in this category.</p>
        )}
      </div>
    </div>
  )
}
