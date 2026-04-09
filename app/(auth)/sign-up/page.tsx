"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getSafeRedirectTarget, mergeGuestCart } from "@/lib/auth/post-auth"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirectTarget(searchParams.get("redirectTo"))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    })
    
    setLoading(false)

    if (error) {
      toast.error(error.message || "Failed to sign up")
    } else {
      try {
        await mergeGuestCart()
      } catch {
        toast.error("Account created, but we could not merge your guest cart")
      } finally {
        toast.success("Account created successfully")
        router.push(redirectTo)
        router.refresh()
      }
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-8 shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create an Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join FluxCart today
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            minLength={8}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link
          href={`/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
