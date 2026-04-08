import { productService } from "@/lib/modules/products/product.service"
import { categoryService } from "@/lib/modules/categories/category.service"
import { ProductCard } from "@/components/product-card"
import { ProductsSortField } from "@/components/products-sort-field"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CategorySummary, ProductSummary } from "@/lib/types/api"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
type ProductSort = "newest" | "price_asc" | "price_desc"

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest arrivals" },
  { value: "price_asc", label: "Price: Low to high" },
  { value: "price_desc", label: "Price: High to low" },
]

function getSingleSearchParam(
  value: string | string[] | undefined
) {
  return typeof value === "string" ? value : undefined
}

function getNumericSearchParam(value: string | string[] | undefined) {
  const singleValue = getSingleSearchParam(value)?.trim()

  if (!singleValue) {
    return undefined
  }

  const parsed = Number(singleValue)

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function getSortByParam(value: string | string[] | undefined): ProductSort {
  const singleValue = getSingleSearchParam(value)

  return SORT_OPTIONS.some((option) => option.value === singleValue)
    ? (singleValue as ProductSort)
    : "newest"
}

function buildProductsHref(params: {
  page?: number
  category?: string
  search?: string
  focus?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sortBy?: ProductSort
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
  if (params.minPrice !== undefined) {
    query.set("minPrice", String(params.minPrice))
  }
  if (params.maxPrice !== undefined) {
    query.set("maxPrice", String(params.maxPrice))
  }
  if (params.inStock) {
    query.set("inStock", "true")
  }
  if (params.sortBy && params.sortBy !== "newest") {
    query.set("sortBy", params.sortBy)
  }

  const queryString = query.toString()
  return queryString ? `/products?${queryString}` : "/products"
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams

  const pageParam = Number(getSingleSearchParam(resolvedSearchParams?.page))
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const categoryStr = getSingleSearchParam(resolvedSearchParams?.category)
  const search = getSingleSearchParam(resolvedSearchParams?.search)?.trim()
  const focus = getSingleSearchParam(resolvedSearchParams?.focus)
  const minPrice = getNumericSearchParam(resolvedSearchParams?.minPrice)
  const maxPrice = getNumericSearchParam(resolvedSearchParams?.maxPrice)
  const inStock = getSingleSearchParam(resolvedSearchParams?.inStock) === "true"
  const sortBy = getSortByParam(resolvedSearchParams?.sortBy)

  const [productsResponse, categories] = await Promise.all([
    productService.list({
      page,
      limit: 12,
      category: categoryStr,
      search,
      minPrice,
      maxPrice,
      inStock,
      sortBy,
    }),
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
  const activeSortLabel = SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? "Newest arrivals"
  const hasActiveFilters = Boolean(
    categoryStr || search || minPrice !== undefined || maxPrice !== undefined || inStock || sortBy !== "newest"
  )
  const clearFiltersHref = buildProductsHref({})
  const clearSearchHref = buildProductsHref({
    category: categoryStr,
    minPrice,
    maxPrice,
    inStock,
    sortBy,
  })
  const currentState = {
    category: categoryStr,
    search,
    minPrice,
    maxPrice,
    inStock,
    sortBy,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full shrink-0 space-y-6 md:w-72">
          <div>
             <h3 className="mb-3 font-semibold">Categories</h3>
             <div className="flex flex-col gap-2">
                <Link
                  href={buildProductsHref({
                    search,
                    minPrice,
                    maxPrice,
                    inStock,
                    sortBy,
                  })}
                  className={`text-sm ${!categoryStr ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  All Products
                </Link>
                {categories.map((cat: CategorySummary) => (
                  <Link
                    key={cat.id}
                    href={buildProductsHref({
                      category: cat.slug,
                      search,
                      minPrice,
                      maxPrice,
                      inStock,
                      sortBy,
                    })}
                    className={`text-sm ${categoryStr === cat.slug ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {cat.name}
                  </Link>
                ))}
             </div>
          </div>

          <form action="/products" className="rounded-4xl border border-border/70 bg-muted/30 p-5">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="products-search">Search</Label>
                <Input
                  id="products-search"
                  name="search"
                  type="search"
                  defaultValue={search}
                  autoFocus={focus === "search"}
                  placeholder="Search products by name"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                <div className="space-y-2">
                  <Label htmlFor="products-min-price">Min price</Label>
                  <Input
                    id="products-min-price"
                    name="minPrice"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    defaultValue={minPrice?.toString()}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="products-max-price">Max price</Label>
                  <Input
                    id="products-max-price"
                    name="maxPrice"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    defaultValue={maxPrice?.toString()}
                    placeholder="250.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="products-sort">Sort by</Label>
                <ProductsSortField defaultValue={sortBy} options={SORT_OPTIONS} />
              </div>

              <label className="flex items-center gap-3 rounded-3xl border border-border/70 bg-background/80 px-4 py-3 text-sm font-medium">
                <input
                  type="checkbox"
                  name="inStock"
                  value="true"
                  defaultChecked={inStock}
                  className="size-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
                />
                Only show in-stock items
              </label>

              {categoryStr ? <input type="hidden" name="category" value={categoryStr} /> : null}

              <div className="flex flex-wrap gap-2">
                <Button type="submit">Apply filters</Button>
                {hasActiveFilters ? (
                  <Button variant="outline" asChild>
                    <Link href={clearFiltersHref}>Reset all</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </form>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{resultsLabel}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {search ? (
                <span>
                  Showing matches for <span className="font-medium text-foreground">{search}</span>
                  {categoryStr ? ` in ${heading}` : ""}.
                </span>
              ) : null}
              <span>Sorted by {activeSortLabel.toLowerCase()}.</span>
              {minPrice !== undefined || maxPrice !== undefined ? (
                <span>
                  Price range: {minPrice !== undefined ? `$${minPrice}` : "$0"} to{" "}
                  {maxPrice !== undefined ? `$${maxPrice}` : "any"}
                </span>
              ) : null}
              {inStock ? <span>In-stock items only.</span> : null}
              {search ? (
                <Button variant="link" asChild className="h-auto px-0 text-sm">
                  <Link href={clearSearchHref}>Clear search</Link>
                </Button>
              ) : null}
            </div>
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
                       <Link href={buildProductsHref({ ...currentState, page: meta!.page - 1 })}>Previous</Link>
                     </Button>
                   )}
                   <div className="flex items-center px-4 text-sm font-medium">
                     Page {meta!.page} of {meta!.totalPages}
                   </div>
                   {meta!.page < meta!.totalPages && (
                     <Button variant="outline" asChild>
                       <Link href={buildProductsHref({ ...currentState, page: meta!.page + 1 })}>Next</Link>
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
               {hasActiveFilters && (
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
