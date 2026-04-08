"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Delete02Icon, StarIcon } from "@hugeicons/core-free-icons"

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAddresses = () => {
    setLoading(true)
    fetch("/api/users/me/addresses")
      .then(res => res.json())
      .then(res => {
        if (res.success) setAddresses(res.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return
    try {
      const res = await fetch(`/api/users/me/addresses/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success("Address deleted")
        fetchAddresses()
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
      const data = await res.json()
      if (data.success) {
        toast.success("Default address updated")
        fetchAddresses()
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
        <Button>
          <HugeiconsIcon icon={PlusSignIcon} size={18} className="mr-2" />
          Add New
        </Button>
      </div>

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
