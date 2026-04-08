# FluxCart — Working Doc

> This is the current working-state document for the repository.
> Use this alongside `docs/01-claude-context.md`.
> When the code and the handoff doc diverge, prefer the code plus this file.

---

## Purpose

This document records:
- what was recently fixed
- what is currently true in the codebase
- what remains to be done
- what should be treated as follow-up instead of unresolved breakage

---

## Current Status

### Recently Completed
- API contract realigned to match the handoff doc for cart, category, and product public routes
- Cart implementation split correctly:
  - guest cart = Redis
  - authenticated cart = Postgres + Redis cache
- Order checkout tightened:
  - stock validation happens inside the transaction
  - product rows are locked before final stock decrement
  - totals use `Prisma.Decimal`
- Customer cancel flow restricted back to `PENDING` orders only
- Storefront/admin pages updated to the corrected route contract
- `/account/addresses` now supports creating addresses from the customer UI via the existing `POST /api/users/me/addresses` route
- `/admin/categories` now supports category creation, editing, and deletion from the admin UI via the existing category API routes
- `/admin/products` now supports product creation, editing, and soft deletion from the admin UI via the existing product API routes
- `/admin/orders/[id]` now uses the shared admin card/select primitives with a clearer detail layout for fulfillment, items, customer, shipping, and financial sections
- Global toast notifications are now mounted in the root layout, so async failures such as offline address submission are visible to the user
- `/cart` and the cart sheet checkout CTAs now route directly to `/checkout`
- Product stock now refreshes correctly after checkout and order cancellation because order-side product caches are invalidated after stock changes
- Authenticated cart state now clears correctly after checkout because order creation also invalidates the Redis user-cart cache after deleting cart rows
- Storefront cart state is now shared through SWR instead of a custom browser event helper, and `swr` is installed in the app dependencies
- Order mutation responses now preserve the same full detail shape as order detail reads, preventing runtime crashes after admin status changes and customer cancellation
- `npm run typecheck` passes
- `npm run lint` passes

### Repo Snapshot
- Documentation last reviewed against repo HEAD `6940373`

---

## Current API Shape

### Categories
- `GET /api/categories`
- `GET /api/categories/:slug`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`

Implementation note:
- Public reads currently work through both:
  - [`app/api/categories/[id]/route.ts`](../app/api/categories/[id]/route.ts), where `GET` treats the dynamic segment as a slug and admin mutations treat it as an id
  - [`app/api/categories/by-slug/[slug]/route.ts`](../app/api/categories/by-slug/[slug]/route.ts), which provides an explicit slug route

### Products
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `PATCH /api/products/:id/inventory`

Implementation note:
- Public reads currently work through both:
  - [`app/api/products/[id]/route.ts`](../app/api/products/[id]/route.ts), where `GET` treats the dynamic segment as a slug and admin mutations treat it as an id
  - [`app/api/products/by-slug/[slug]/route.ts`](../app/api/products/by-slug/[slug]/route.ts), which provides an explicit slug route

### Cart
- `GET /api/cart`
- `DELETE /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:productId`
- `DELETE /api/cart/items/:productId`
- `POST /api/cart/merge`

Implementation note:
- guest cart state is stored in Redis under `RedisKeys.guestCart(sessionId)`
- authenticated cart state is stored in DB and cached in Redis under `RedisKeys.userCart(userId)`
- cart item routes use `productId`, not `cartItem.id`

### Orders
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id/cancel`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/stats`

---

## Important Implementation Notes

### Cart
- Main implementation lives in [`lib/modules/cart/cart.service.ts`](../lib/modules/cart/cart.service.ts)
- Guest carts do not create `Cart` or `CartItem` rows
- Guest cart responses are hydrated from Redis item payloads plus live product data
- Auth cart responses are hydrated from DB cart rows
- Auth cart reads are cached in Redis under `RedisKeys.userCart(userId)` and must be invalidated by non-cart mutations such as successful checkout
- Cart response types are centralized in [`lib/types/api.ts`](../lib/types/api.ts)

### Orders
- Main implementation lives in [`lib/modules/orders/order.service.ts`](../lib/modules/orders/order.service.ts)
- Checkout uses `db.$transaction(...)`
- Product rows are locked using `FOR UPDATE` before final validation and decrement
- `totalAmount` is built with `Prisma.Decimal`
- Successful checkout and customer cancellation now invalidate affected Redis product detail/list caches after stock changes
- Customer cancellation is limited to `PENDING`
- Admin order status input is schema-validated in [`lib/modules/orders/order.schema.ts`](../lib/modules/orders/order.schema.ts)
- Order mutation endpoints used by detail pages now return the same nested shape as their corresponding `GET` endpoints:
  - customer cancel includes `items` and `address`
  - admin status update includes `items`, `address`, and `user`

### Frontend
- Storefront cart UI now calls `/api/cart/items/:productId`
- Storefront checkout CTAs now consistently target `/checkout`
- Client cart surfaces now share `/api/cart` state through SWR, so cart mutations update the navbar cart sheet and cart page through a single cache instead of browser events
- Storefront/admin pages were typed against shared API view models in [`lib/types/api.ts`](../lib/types/api.ts)
- Storefront product discovery now exposes URL-driven search on `/products`, including search result messaging and query preservation through category changes and pagination
- Storefront product discovery now also exposes URL-driven `minPrice`, `maxPrice`, `inStock`, and `sortBy` controls on `/products`, and preserves the full query state through category changes and pagination
- Address management UI in [`app/(storefront)/account/addresses/page.tsx`](../app/(storefront)/account/addresses/page.tsx) now includes a client-side create flow with dialog state, controlled form inputs, and list refresh after success
- Category management UI in [`app/(admin)/admin/categories/page.tsx`](../app/(admin)/admin/categories/page.tsx) now includes create and edit dialog flows plus row-level delete handling against `/api/categories` and `/api/categories/:id`
- Product management UI in [`app/(admin)/admin/products/page.tsx`](../app/(admin)/admin/products/page.tsx) now includes create and edit dialog flows, category selection, image URL parsing, and row-level soft delete handling against `/api/products` and `/api/products/:id`
- Admin order detail UI in [`app/(admin)/admin/orders/[id]/page.tsx`](../app/(admin)/admin/orders/[id]/page.tsx) now uses shared card/select primitives and a structured detail layout instead of ad-hoc blocks and a native select
- Global toast rendering is mounted in [`app/layout.tsx`](../app/layout.tsx) through [`components/ui/sonner.tsx`](../components/ui/sonner.tsx)

---

## Known Gaps

These are still open and should be treated as planned follow-up:

### Stack / Dependency Drift
- `docs/01-claude-context.md` previously lagged behind the checked-in package versions and local service versions
- Vitest + Supertest are still not installed
- Swagger tooling is still not installed

This is documentation/platform drift, not a current compile/lint failure.

### Documentation Drift
- `docs/01-claude-context.md` still describes the project as if only early implementation steps are done
- It also still describes several “next to build” areas that already exist in code

Recommended follow-up:
- either refresh `docs/01-claude-context.md`
- or keep it as historical handoff and move active truth into `docs/02-working-doc.md`

### Tests
- The codebase now passes lint and typecheck
- There is still no automated test suite wired in for API/service behavior

Recommended next step:
- add Vitest for service-level tests
- add API route integration tests for checkout, cart merge, admin status update, and address flows

### UI Polish
- The toaster is now functional, but its presentation is still close to Sonner defaults because there are no repo-level styles for the `cn-toast`/`toaster` class hooks yet

Recommended next step:
- decide whether to keep the stock Sonner appearance
- or add project-specific toast styling in [`app/globals.css`](../app/globals.css)

---

## Recommended Next Tasks

1. Add Vitest + Supertest and cover cart/order critical paths
2. Decide whether to keep both the legacy dual-purpose `[id]` routes and the explicit `by-slug` routes, or consolidate on one approach
3. Keep `docs/01-claude-context.md` aligned as implementation continues
4. Add Swagger / OpenAPI generation if that remains a portfolio requirement

---

## Operational Notes

- Do not revert unrelated local files such as `.env`, `README.md`, `.env.example`, or `compose.yaml` without checking intent first
- If a future change touches API shapes, update both this file and `docs/01-claude-context.md`
- If cart semantics change again, verify all three layers together:
  - route contract
  - `cart.service`
  - storefront cart/checkout UI
