"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { authClient } from "@/lib/auth/client"
import { useRouter } from "next/navigation"
import type { ApiResponse, ProfileView } from "@/lib/types/api"

export default function AccountPage() {
  const [profile, setProfile] = useState<ProfileView | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json() as Promise<ApiResponse<ProfileView>>)
      .then((res) => {
        if (res.success) {
          setProfile(res.data)
        } else {
          router.push("/sign-in")
        }
      })
      .catch(() => router.push("/sign-in"))
      .finally(() => setLoading(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name })
      })
      const data = (await res.json()) as ApiResponse<ProfileView>
      if (data.success) {
        setProfile(data.data)
        toast.success("Profile updated successfully")
      } else {
        toast.error(data.message || "Failed to update profile")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  if (loading) return <div className="p-8 text-center">Loading profile...</div>
  if (!profile) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Account Overview</h1>
        <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">Profile Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 max-w-sm">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile.email} disabled />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={profile.name || ""} 
              onChange={e => setProfile({...profile, name: e.target.value})} 
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  )
}
