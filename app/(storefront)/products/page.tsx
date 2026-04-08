import { productService } from "@/lib/modules/products/product.service"
import { categoryService } from "@/lib/modules/categories/category.service"
import { ProductCard } from "@/components/product-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CategorySummary, ProductSummary } from "@/lib/types/api"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function getSingleSearchParam(
  value: string | string[] | undefined
) {
  return typeof value === "string" ? value : undefined
}

function buildProductsHref(params: {
  page?: number
  category?: string
  search?: string
  focus?: string
}) {
  const query = new URLSearchParams()

  if (params.page && params.page > 1) {
    query.set("page", String(params.page))
  }
  if (params.category) {
    query.set("category", params.category)
  }
  if (params.search) {
    query.set("search", params.search)
  }
  if (params.focus) {
    query.set("focus", params.focus)
  }

  const queryString = query.toString()
  return queryString ? `/products?${queryString}` : "/products"
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams

  const page = Number(resolvedSearchParams?.page) || 1
  const categoryStr = getSingleSearchParam(resolvedSearchParams?.category)
  const search = getSingleSearchParam(resolvedSearchParams?.search)?.trim()
  const focus = getSingleSearchParam(resolvedSearchParams?.focus)

  const [productsResponse, categories] = await Promise.all([
    productService.list({ page, limit: 12, category: categoryStr, search }),
    categoryService.list()
  ])

  const { data: products, meta } = productsResponse
  const heading =
    categoryStr
      ? categories.find((c: CategorySummary) => c.slug === categoryStr)?.name || "Products"
      : "All Products"
  const resultsLabel = search
    ? `${meta!.total} results for "${search}"`
    : `${meta!.total} products`
  const clearFiltersHref = buildProductsHref({})
  const clearSearchHref = buildProductsHref({ category: categoryStr })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div>
             <h3 className="mb-3 font-semibold">Categories</h3>
             <div className="flex flex-col gap-2">
                <Link
                  href={buildProductsHref({ search })}
                  className={`text-sm ${!categoryStr ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  All Products
                </Link>
                {categories.map((cat: CategorySummary) => (
                  <Link
                    key={cat.id}
                    href={buildProductsHref({ category: cat.slug, search })}
                    className={`text-sm ${categoryStr === cat.slug ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {cat.name}
                  </Link>
                ))}
             </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{resultsLabel}</p>
              </div>

              <form action="/products" className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
                {categoryStr && <input type="hidden" name="category" value={categoryStr} />}
                <Input
                  name="search"
                  type="search"
                  defaultValue={search}
                  autoFocus={focus === "search"}
                  placeholder="Search products by name"
                  aria-label="Search products"
                  className="rounded-xl"
                />
                <div className="flex gap-2">
                  <Button type="submit">Search</Button>
                  {search ? (
                    <Button variant="outline" asChild>
                      <Link href={clearSearchHref}>Clear</Link>
                    </Button>
                  ) : null}
                </div>
              </form>
            </div>

            {search ? (
              <p className="text-sm text-muted-foreground">
                Showing matches for <span className="font-medium text-foreground">{search}</span>
                {categoryStr ? ` in ${heading}` : ""}.
              </p>
            ) : null}
          </div>

           {products.length > 0 ? (
             <>
               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                 {products.map((product: ProductSummary) => (
                   <ProductCard key={product.id} product={product} />
                 ))}
               </div>
               
               {/* Pagination controls */}
               {meta!.totalPages > 1 && (
                 <div className="mt-10 flex justify-center gap-2">
                   {meta!.page > 1 && (
                     <Button variant="outline" asChild>
                       <Link href={buildProductsHref({ page: meta!.page - 1, category: categoryStr, search })}>Previous</Link>
                     </Button>
                   )}
                   <div className="flex items-center px-4 text-sm font-medium">
                     Page {meta!.page} of {meta!.totalPages}
                   </div>
                   {meta!.page < meta!.totalPages && (
                     <Button variant="outline" asChild>
                       <Link href={buildProductsHref({ page: meta!.page + 1, category: categoryStr, search })}>Next</Link>
                     </Button>
                   )}
                 </div>
               )}
             </>
           ) : (
             <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-center">
               <h3 className="text-lg font-semibold tracking-tight">No products found</h3>
               <p className="mt-1 text-sm text-muted-foreground">
                 {search
                   ? `No products matched "${search}". Try a different keyword or clear your filters.`
                   : "Try adjusting your filters."}
               </p>
               {(categoryStr || search) && (
                 <Button variant="link" asChild className="mt-4">
                   <Link href={clearFiltersHref}>Clear filters</Link>
                 </Button>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
