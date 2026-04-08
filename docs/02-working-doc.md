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
- `npm run typecheck` passes
- `npm run lint` passes

### Last Fix Commit
- `a770a17` — `Align API contract and cart/order behavior with handoff doc`

---

## Current API Shape

### Categories
- `GET /api/categories`
- `GET /api/categories/:slug`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`

Implementation note:
- Public reads are handled by `GET` on [`app/api/categories/[id]/route.ts`](../app/api/categories/[id]/route.ts), where the dynamic segment is treated as a slug for `GET` and as an id for admin mutations.

### Products
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `PATCH /api/products/:id/inventory`

Implementation note:
- Public reads are handled by `GET` on [`app/api/products/[id]/route.ts`](../app/api/products/[id]/route.ts), where the dynamic segment is treated as a slug for `GET` and as an id for admin mutations.

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
- Cart response types are centralized in [`lib/types/api.ts`](../lib/types/api.ts)

### Orders
- Main implementation lives in [`lib/modules/orders/order.service.ts`](../lib/modules/orders/order.service.ts)
- Checkout uses `db.$transaction(...)`
- Product rows are locked using `FOR UPDATE` before final validation and decrement
- `totalAmount` is built with `Prisma.Decimal`
- Customer cancellation is limited to `PENDING`
- Admin order status input is schema-validated in [`lib/modules/orders/order.schema.ts`](../lib/modules/orders/order.schema.ts)

### Frontend
- Storefront cart UI now calls `/api/cart/items/:productId`
- Storefront/admin pages were typed against shared API view models in [`lib/types/api.ts`](../lib/types/api.ts)

---

## Known Gaps

These are still open and should be treated as planned follow-up:

### Stack / Dependency Drift
- `docs/01-claude-context.md` locks Next.js `16.2.2`
- `package.json` is still on Next.js `16.1.7`
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

---

## Recommended Next Tasks

1. Reconcile `package.json` with the locked stack in `docs/01-claude-context.md`
2. Add Vitest + Supertest and cover cart/order critical paths
3. Decide whether to keep slug-read/id-mutate dual-purpose dynamic routes or split them into separate route folders
4. Update `docs/01-claude-context.md` so it no longer misstates implementation progress
5. Add Swagger / OpenAPI generation if that remains a portfolio requirement

---

## Operational Notes

- Do not revert unrelated local files such as `.env`, `README.md`, `.env.example`, or `compose.yaml` without checking intent first
- If a future change touches API shapes, update both this file and `docs/01-claude-context.md`
- If cart semantics change again, verify all three layers together:
  - route contract
  - `cart.service`
  - storefront cart/checkout UI
