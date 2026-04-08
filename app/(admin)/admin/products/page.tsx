"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { PlusSignIcon, Edit02Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"
import type { ApiResponse, CategorySummary, ProductSummary } from "@/lib/types/api"

interface ApiErrorResponse {
  success: false
  statusCode: number
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
}

const INITIAL_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  imageUrls: "",
  categoryId: "",
  isActive: "true",
}

function parseImageUrls(value: string) {
  return value
    .split(/[\n,]/)
    .map((url) => url.trim())
    .filter(Boolean)
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductSummary | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)

  async function loadProducts() {
    const response = await fetch("/api/products?limit=50")
    const payload = await response.json() as ApiResponse<ProductSummary[]> | ApiErrorResponse

    if (!response.ok || !payload.success) {
      throw new Error("message" in payload ? payload.message : "Failed to load products")
    }

    setProducts(payload.data)
  }

  async function loadCategories() {
    const response = await fetch("/api/categories")
    const payload = await response.json() as ApiResponse<CategorySummary[]> | ApiErrorResponse

    if (!response.ok || !payload.success) {
      throw new Error("message" in payload ? payload.message : "Failed to load categories")
    }

    setCategories(payload.data)
  }

  useEffect(() => {
    Promise.all([loadProducts(), loadCategories()])
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Error loading admin product data"
        toast.error(message)
      })
      .finally(() => setIsLoading(false))
  }, [])

  function updateForm<K extends keyof typeof INITIAL_FORM>(field: K, value: (typeof INITIAL_FORM)[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function resetForm() {
    setForm(INITIAL_FORM)
    setEditingProduct(null)
  }

  function openCreateDialog() {
    resetForm()
    setIsDialogOpen(true)
  }

  function openEditDialog(product: ProductSummary) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      stock: String(product.stock),
      imageUrls: product.imageUrls.join("\n"),
      categoryId: product.category?.id ?? "",
      isActive: product.isActive ? "true" : "false",
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const isEditing = editingProduct !== null
      const response = await fetch(isEditing ? `/api/products/${editingProduct.id}` : "/api/products", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
          imageUrls: parseImageUrls(form.imageUrls),
          categoryId: form.categoryId,
          isActive: form.isActive === "true",
        }),
      })

      const payload = await response.json() as ApiResponse<ProductSummary> | ApiErrorResponse

      if (!response.ok || !payload.success) {
        const errorMessage = "message" in payload ? payload.message : "Failed to save product"
        toast.error(errorMessage)
        return
      }

      await loadProducts()
      resetForm()
      setIsDialogOpen(false)
      toast.success(isEditing ? "Product updated" : "Product created")
    } catch {
      toast.error(editingProduct ? "Error updating product" : "Error creating product")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteProduct(productId: string) {
    setDeleteProductId(productId)

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })
      const payload = await response.json() as ApiResponse<{ success: true }> | ApiErrorResponse

      if (!response.ok || !payload.success) {
        const errorMessage = "message" in payload ? payload.message : "Failed to delete product"
        toast.error(errorMessage)
        return
      }

      await loadProducts()
      toast.success("Product deleted")
    } catch {
      toast.error("Error deleting product")
    } finally {
      setDeleteProductId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              resetForm()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <HugeiconsIcon icon={PlusSignIcon} size={18} className="mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Update the product details. The slug will be regenerated if the name changes."
                  : "Create a new catalog product for the storefront and admin inventory views."}
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="product-name">Name</Label>
                  <Input
                    id="product-name"
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder="Minimal Backpack"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    value={form.description}
                    onChange={(event) => updateForm("description", event.target.value)}
                    placeholder="Short product summary for the detail page."
                    disabled={isSubmitting}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-price">Price</Label>
                  <Input
                    id="product-price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => updateForm("price", event.target.value)}
                    placeholder="79.99"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-stock">Stock</Label>
                  <Input
                    id="product-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(event) => updateForm("stock", event.target.value)}
                    placeholder="25"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(value) => updateForm("categoryId", value)}
                    disabled={isSubmitting || categories.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.isActive}
                    onValueChange={(value) => updateForm("isActive", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="product-images">Image URLs</Label>
                  <Textarea
                    id="product-images"
                    value={form.imageUrls}
                    onChange={(event) => updateForm("imageUrls", event.target.value)}
                    placeholder={"https://example.com/front.jpg\nhttps://example.com/detail.jpg"}
                    disabled={isSubmitting}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">Separate URLs with commas or new lines.</p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || categories.length === 0}>
                  {isSubmitting ? (editingProduct ? "Saving..." : "Creating...") : (editingProduct ? "Save Changes" : "Create Product")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="line-clamp-1">{product.name}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.category?.name || "Unknown"}</TableCell>
                  <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    {product.isActive ? (
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                        <HugeiconsIcon icon={Edit02Icon} size={18} />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deleteProductId === product.id}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={18} />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
