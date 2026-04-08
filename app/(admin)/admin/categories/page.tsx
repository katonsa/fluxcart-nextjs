"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { PlusSignIcon, Edit02Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"
import type { ApiResponse, CategorySummary } from "@/lib/types/api"

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
  imageUrl: "",
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategorySummary | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json() as Promise<ApiResponse<CategorySummary[]>>)
      .then((res) => {
        if (res.success) {
          setCategories(res.data)
        } else {
          toast.error("Failed to load categories")
        }
      })
      .catch(() => toast.error("Error loading categories"))
      .finally(() => setIsLoading(false))
  }, [])

  function updateForm<K extends keyof typeof INITIAL_FORM>(field: K, value: (typeof INITIAL_FORM)[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function resetForm() {
    setForm(INITIAL_FORM)
    setEditingCategory(null)
  }

  function openCreateDialog() {
    resetForm()
    setIsDialogOpen(true)
  }

  function openEditDialog(category: CategorySummary) {
    setEditingCategory(category)
    setForm({
      name: category.name,
      description: category.description ?? "",
      imageUrl: category.imageUrl ?? "",
    })
    setIsDialogOpen(true)
  }

  async function handleCreateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const isEditing = editingCategory !== null
      const response = await fetch(isEditing ? `/api/categories/${editingCategory.id}` : "/api/categories", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const payload = await response.json() as ApiResponse<CategorySummary> | ApiErrorResponse

      if (!response.ok || !payload.success) {
        const errorMessage = "message" in payload ? payload.message : "Failed to create category"
        toast.error(errorMessage)
        return
      }

      setCategories((current) => (
        isEditing
          ? current.map((category) => (category.id === payload.data.id ? { ...category, ...payload.data } : category))
          : [payload.data, ...current]
      ))
      resetForm()
      setIsDialogOpen(false)
      toast.success(isEditing ? "Category updated" : "Category created")
    } catch {
      toast.error(editingCategory ? "Error updating category" : "Error creating category")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    setDeleteCategoryId(categoryId)

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      const payload = await response.json() as ApiResponse<{ success: true }> | ApiErrorResponse

      if (!response.ok || !payload.success) {
        const errorMessage = "message" in payload ? payload.message : "Failed to delete category"
        toast.error(errorMessage)
        return
      }

      setCategories((current) => current.filter((category) => category.id !== categoryId))
      toast.success("Category deleted")
    } catch {
      toast.error("Error deleting category")
    } finally {
      setDeleteCategoryId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
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
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Update the category details. The slug will be regenerated if the name changes."
                  : "Create a new storefront category. The slug will be generated automatically from the name."}
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleCreateCategory}>
              <div className="space-y-2">
                <Label htmlFor="category-name">Name</Label>
                <Input
                  id="category-name"
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  placeholder="Accessories"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={form.description}
                  onChange={(event) => updateForm("description", event.target.value)}
                  placeholder="Optional short summary for admin and storefront use."
                  disabled={isSubmitting}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-image-url">Image URL</Label>
                <Input
                  id="category-image-url"
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) => updateForm("imageUrl", event.target.value)}
                  placeholder="https://example.com/category-cover.jpg"
                  disabled={isSubmitting}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (editingCategory ? "Saving..." : "Creating...") : (editingCategory ? "Save Changes" : "Create Category")}
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
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell>{cat._count?.products || 0}</TableCell>
                  <TableCell>
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(cat)}>
                        <HugeiconsIcon icon={Edit02Icon} size={18} />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteCategory(cat.id)}
                        disabled={deleteCategoryId === cat.id}
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
