import Link from "next/link"
import { Button } from "@/components/ui/button"
import { buildStorefrontAuthUrl } from "@/lib/auth/storefront"

interface RouteAuthExplainerProps {
  title: string
  description: string
  redirectTo: string
  footer?: string
}

export function RouteAuthExplainer({
  title,
  description,
  redirectTo,
  footer = "You’ll return here after authentication.",
}: RouteAuthExplainerProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full rounded-3xl border bg-card p-8 shadow-sm sm:p-10">
        <div className="mb-6 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
          Sign in required
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          {description}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={buildStorefrontAuthUrl(redirectTo)}>Sign in to continue</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/sign-up?${new URLSearchParams({ redirectTo }).toString()}`}>
              Create account
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {footer}
        </p>
      </div>
    </div>
  )
}
