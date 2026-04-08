import { productService } from "@/lib/modules/products/product.service"
import { categoryService } from "@/lib/modules/categories/category.service"
import { ProductCard } from "@/components/product-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams
  
  const page = Number(resolvedSearchParams?.page) || 1
  const categoryStr = typeof resolvedSearchParams?.category === 'string' ? resolvedSearchParams.category : undefined
  
  const [productsResponse, categories] = await Promise.all([
    productService.list({ page, limit: 12, category: categoryStr }),
    categoryService.list()
  ])
  
  const { data: products, meta } = productsResponse

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div>
             <h3 className="mb-3 font-semibold">Categories</h3>
             <div className="flex flex-col gap-2">
                <Link 
                  href="/products" 
                  className={`text-sm ${!categoryStr ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  All Products
                </Link>
                {categories.map((cat: any) => (
                  <Link 
                    key={cat.id} 
                    href={`/products?category=${cat.slug}`} 
                    className={`text-sm ${categoryStr === cat.slug ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {cat.name}
                  </Link>
                ))}
             </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
           <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">
                {categoryStr ? categories.find((c: any) => c.slug === categoryStr)?.name || "Products" : "All Products"}
              </h1>
              <span className="text-sm text-muted-foreground">{meta!.total} products</span>
           </div>

           {products.length > 0 ? (
             <>
               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                 {products.map((product: any) => (
                   <ProductCard key={product.id} product={product as any} />
                 ))}
               </div>
               
               {/* Pagination controls */}
               {meta!.totalPages > 1 && (
                 <div className="mt-10 flex justify-center gap-2">
                   {meta!.page > 1 && (
                     <Button variant="outline" asChild>
                       <Link href={`/products?page=${meta!.page - 1}${categoryStr ? `&category=${categoryStr}` : ''}`}>Previous</Link>
                     </Button>
                   )}
                   <div className="flex items-center px-4 text-sm font-medium">
                     Page {meta!.page} of {meta!.totalPages}
                   </div>
                   {meta!.page < meta!.totalPages && (
                     <Button variant="outline" asChild>
                       <Link href={`/products?page=${meta!.page + 1}${categoryStr ? `&category=${categoryStr}` : ''}`}>Next</Link>
                     </Button>
                   )}
                 </div>
               )}
             </>
           ) : (
             <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-center">
               <h3 className="text-lg font-semibold tracking-tight">No products found</h3>
               <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
               {categoryStr && (
                 <Button variant="link" asChild className="mt-4">
                   <Link href="/products">Clear filters</Link>
                 </Button>
               )}
             </div>
           )}
        </div>

      </div>
    </div>
  )
}
