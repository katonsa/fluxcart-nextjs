"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Delete02Icon, StarIcon } from "@hugeicons/core-free-icons"
import type { AddressView, ApiResponse } from "@/lib/types/api"
import type { AddressInput } from "@/lib/modules/users/user.schema"

const EMPTY_FORM: AddressInput = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  isDefault: false,
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressView[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM)

  const fetchAddresses = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/users/me/addresses")
      const data = (await res.json()) as ApiResponse<AddressView[]>
      if (data.success) {
        setAddresses(data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAddresses()
  }, [])

  const updateForm = <K extends keyof AddressInput>(key: K, value: AddressInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
      isDefault: addresses.length === 0,
    })
  }

  const handleCreateOpenChange = (open: boolean) => {
    setCreateOpen(open)
    if (open) {
      resetForm()
    }
  }

  const handleCreateAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreating(true)

    try {
      const res = await fetch("/api/users/me/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = (await res.json()) as ApiResponse<AddressView>

      if (data.success) {
        toast.success("Address added")
        setCreateOpen(false)
        resetForm()
        await fetchAddresses()
      } else {
        toast.error(data.message || "Failed to add address")
      }
    } catch {
      toast.error("Error occurred")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return
    try {
      const res = await fetch(`/api/users/me/addresses/${id}`, { method: "DELETE" })
      const data = (await res.json()) as ApiResponse<{ success: true }>
      if (data.success) {
        toast.success("Address deleted")
        void fetchAddresses()
      } else {
        toast.error(data.message || "Failed to delete")
      }
    } catch {
      toast.error("Error occurred")
    }
  }

  const handleMakeDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/users/me/addresses/${id}/default`, { method: "PATCH" })
      const data = (await res.json()) as ApiResponse<{ success: true }>
      if (data.success) {
        toast.success("Default address updated")
        void fetchAddresses()
      } else {
        toast.error(data.message || "Failed to update")
      }
    } catch {
      toast.error("Error occurred")
    }
  }

  if (loading && addresses.length === 0) return <div className="p-8 text-center">Loading addresses...</div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Addresses</h1>
        <Button onClick={() => handleCreateOpenChange(true)}>
          <HugeiconsIcon icon={PlusSignIcon} size={18} className="mr-2" />
          Add New
        </Button>
      </div>

      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>Save a delivery address for faster checkout.</DialogDescription>
          </DialogHeader>

          <form className="grid gap-4" onSubmit={handleCreateAddress}>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(event) => updateForm("fullName", event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={form.addressLine1}
                onChange={(event) => updateForm("addressLine1", event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={form.addressLine2}
                onChange={(event) => updateForm("addressLine2", event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(event) => updateForm("city", event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(event) => updateForm("state", event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={form.postalCode}
                  onChange={(event) => updateForm("postalCode", event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(event) => updateForm("country", event.target.value)}
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) => updateForm("isDefault", event.target.checked)}
                disabled={addresses.length === 0}
              />
              Set as default address
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Saving..." : "Save Address"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 sm:grid-cols-2">
        {addresses.map(address => (
          <div key={address.id} className={`relative rounded-xl border p-5 ${address.isDefault ? 'border-primary shadow-sm' : 'bg-card'}`}>
            {address.isDefault && (
              <span className="absolute top-4 right-4 flex items-center text-xs font-medium text-primary">
                <HugeiconsIcon icon={StarIcon} size={14} className="mr-1" />
                Default
              </span>
            )}
            
            <h3 className="font-semibold">{address.fullName}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{address.phone}</p>
            
            <div className="mt-3 text-sm text-muted-foreground">
              <p>{address.addressLine1}</p>
              {address.addressLine2 && <p>{address.addressLine2}</p>}
              <p>{address.city}, {address.state} {address.postalCode}</p>
              <p>{address.country}</p>
            </div>

            <div className="mt-5 flex gap-3">
              {!address.isDefault && (
                <Button variant="outline" size="sm" onClick={() => handleMakeDefault(address.id)}>
                  Set Default
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-destructive ml-auto" onClick={() => handleDelete(address.id)}>
                <HugeiconsIcon icon={Delete02Icon} size={16} className="mr-2" />
                Delete
              </Button>
            </div>
          </div>
        ))}
        
        {addresses.length === 0 && !loading && (
          <div className="col-span-full rounded-xl border border-dashed py-12 text-center text-muted-foreground">
             No addresses saved yet.
          </div>
        )}
      </div>
    </div>
  )
}
