# FluxCart — Project Context Handoff

> This document is a full context handoff for an AI agent continuing development of FluxCart.
> Read this entirely before writing any code.

---

## 🧭 What Is FluxCart?

A **backend-focused e-commerce portfolio project** built as a monolith using Next.js.
The goal is to demonstrate production-grade backend engineering:
microservice-ready module structure, atomic transactions, Redis caching,
RBAC, and full API documentation.

---

## 📋 SDLC Status

| Phase | Status |
|---|---|
| Phase 1 — Planning | ✅ Complete |
| Phase 2 — Requirements | ✅ Complete |
| Phase 3 — System Design | ✅ Complete |
| Phase 4 — Implementation | 🔄 In Progress (core backend and key storefront/admin flows implemented) |
| Phase 5 — Testing | ⏳ Pending |
| Phase 6 — Deployment | ⏳ Pending |
| Phase 7 — Documentation | 🔄 In Progress |

---

## ✅ Locked Tech Stack

> Note: the intended stack below is still the target architecture.
> The current repo has drift in a few places, most notably:
> - Vitest + Supertest are not yet installed
> - Swagger tooling is not yet installed
>
> See `docs/02-working-doc.md` for the current repository truth.

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.2 |
| Language | TypeScript | 5.x |
| Auth | better-auth (admin plugin + RBAC) | latest |
| ORM | Prisma | v7 |
| Database | PostgreSQL | 17 |
| Cache | Redis | 8.6 |
| Validation | Zod | v4.3.4 |
| Logging | Pino | latest |
| Testing | Vitest + Supertest | latest |
| API Docs | Swagger | latest |
| UI | shadcn/ui + Tailwind | latest |
| Redis Client | ioredis | latest |

---

## 👥 User Roles (RBAC)

| Role | How assigned | Access |
|---|---|---|
| `guest` | No session | Browse products, guest cart |
| `customer` | Default on register | Cart, checkout, own orders, profile |
| `admin` | Set via `admin.setRole()` | Everything + product/order/user management |

Custom RBAC resources defined in `lib/auth/permissions.ts`:
- `product` — `["create", "update", "delete", "manage-inventory"]`
- `order` — `["read-all", "update-status"]`
- `category` — `["create", "update", "delete"]`

---

## 🗄️ Database Schema

better-auth owns: `user`, `session`, `account`, `verification` tables.
We have proper Prisma `@relation` back to `User` from domain models (safe because migrations are run manually, not via `npx auth migrate`).

**Workflow:** Run `npx auth generate` to get schema output, then migrate manually.

### Domain Models
- `Category` — id, name, slug, description, imageUrl
- `Product` — id, name, slug, description, price (Decimal 10,2), stock, imageUrls[], isActive, categoryId
- `Cart` — id, userId? (null = guest, managed in Redis)
- `CartItem` — cartId, productId, quantity — `@@unique([cartId, productId])`
- `Address` — userId, fullName, phone, addressLine1-2, city, state, postalCode, country, isDefault
- `Order` — userId, status (OrderStatus enum), totalAmount (Decimal 10,2), addressId, notes
- `OrderItem` — orderId, productId, quantity, unitPrice (snapshot), productName (snapshot), productImage (snapshot)

### OrderStatus Enum
`PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → CANCELLED → REFUNDED`

### Key onDelete Strategies
| Relation | Strategy | Reason |
|---|---|---|
| Cart → User | Cascade | Cart is disposable |
| Address → User | Cascade | Personal data |
| Order → User | Restrict | Financial record |
| CartItem → Cart | Cascade | |
| CartItem → Product | Restrict | Prevent silent product deletion |
| OrderItem → Order | Cascade | |
| OrderItem → Product | Restrict | Financial record integrity |

### User model extra fields (better-auth admin plugin)
```
role       String?
banned     Boolean?  @default(false)
banReason  String?
banExpires DateTime?
```

### Session model extra fields
```
impersonatedBy String?
```

---

## 🗺️ API Endpoint Contract

### Conventions
```
Base URL      : /api
Auth          : Session cookie (better-auth)
Content-Type  : application/json
Pagination    : ?page=1&limit=20
Success       : { success: true, data: {...}, meta?: {...} }
Error         : { success: false, statusCode, message, errors?: [...] }
```

### Auth `/api/auth/**` — better-auth auto-generated
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/sign-up/email` | Guest |
| POST | `/api/auth/sign-in/email` | Guest |
| POST | `/api/auth/sign-out` | Customer |
| GET | `/api/auth/get-session` | Customer |
| POST | `/api/auth/admin/set-role` | Admin |
| POST | `/api/auth/admin/ban-user` | Admin |
| POST | `/api/auth/admin/unban-user` | Admin |
| GET | `/api/auth/admin/list-users` | Admin |
| POST | `/api/auth/admin/revoke-user-sessions` | Admin |

### Users `/api/users/me/**`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/users/me` | Customer |
| PATCH | `/api/users/me` | Customer |
| PATCH | `/api/users/me/password` | Customer |
| GET | `/api/users/me/addresses` | Customer |
| POST | `/api/users/me/addresses` | Customer |
| PATCH | `/api/users/me/addresses/:id` | Customer |
| DELETE | `/api/users/me/addresses/:id` | Customer |
| PATCH | `/api/users/me/addresses/:id/default` | Customer |

### Categories `/api/categories/**`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/categories` | Guest |
| GET | `/api/categories/:slug` | Guest |
| POST | `/api/categories` | Admin |
| PATCH | `/api/categories/:id` | Admin |
| DELETE | `/api/categories/:id` | Admin |

### Products `/api/products/**`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/products` | Guest |
| GET | `/api/products/:slug` | Guest |
| POST | `/api/products` | Admin |
| PATCH | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin (soft delete) |
| PATCH | `/api/products/:id/inventory` | Admin |

Query params: `?page, limit, category, minPrice, maxPrice, search, inStock, sortBy, order`

### Cart `/api/cart/**`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/cart` | Guest + Customer |
| POST | `/api/cart/items` | Guest + Customer |
| PATCH | `/api/cart/items/:productId` | Guest + Customer |
| DELETE | `/api/cart/items/:productId` | Guest + Customer |
| DELETE | `/api/cart` | Guest + Customer |
| POST | `/api/cart/merge` | Customer (called on login) |

### Orders `/api/orders/**`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/orders` | Customer |
| GET | `/api/orders/:id` | Customer |
| POST | `/api/orders` | Customer (checkout) |
| PATCH | `/api/orders/:id/cancel` | Customer (PENDING only) |

Implementation note:
- Order detail mutations that feed UI detail pages are expected to return the same nested shape as `GET /api/orders/:id`, including `items` and `address`.
- Successful checkout also invalidates the authenticated Redis cart cache after cart rows are deleted, so `/api/cart` does not serve stale ordered items.

### Admin `/api/admin/**`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/admin/orders` | Admin |
| GET | `/api/admin/orders/:id` | Admin |
| PATCH | `/api/admin/orders/:id/status` | Admin |
| GET | `/api/admin/stats` | Admin |

Implementation note:
- `PATCH /api/admin/orders/:id/status` is expected to return the same nested detail shape as `GET /api/admin/orders/:id`, including `items`, `address`, and `user`.

### Route Implementation Note
- The repo currently supports public category/product reads in two ways:
  - legacy dual-purpose dynamic routes:
    - `app/api/categories/[id]/route.ts`
    - `app/api/products/[id]/route.ts`
  - explicit slug routes:
    - `app/api/categories/by-slug/[slug]/route.ts`
    - `app/api/products/by-slug/[slug]/route.ts`
- In the legacy `[id]` routes, `GET` treats the dynamic segment as a slug, while `PATCH` / `DELETE` treat it as a database id.
- The explicit `by-slug` routes now coexist with the legacy shorthand, so the route structure is in transition rather than fully standardized.

---

## 📁 Project Structure

```
fluxcart/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/route.ts       ✅ implemented
│   │   ├── users/me/**                  ✅ implemented
│   │   ├── categories/**                ✅ implemented
│   │   ├── products/**                  ✅ implemented
│   │   ├── cart/**                      ✅ implemented
│   │   ├── orders/**                    ✅ implemented
│   │   └── admin/**                     ✅ implemented
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── theme-provider.tsx
│   └── ui/button.tsx
├── hooks/
├── lib/
│   ├── auth/
│   │   ├── index.ts        ✅ better-auth server config
│   │   ├── client.ts       ✅ better-auth client
│   │   └── permissions.ts  ✅ RBAC ac, admin, customer roles
│   ├── api/
│   │   ├── response.ts     ✅ ok, created, notFound, etc.
│   │   ├── errors.ts       ✅ ApiError class + withErrorHandler
│   │   └── middleware.ts   ✅ requireAuth, requireAdmin, requirePermission
│   ├── modules/            ✅ service layer implemented
│   │   ├── users/          ✅
│   │   ├── categories/     ✅
│   │   ├── products/       ✅
│   │   ├── cart/           ✅
│   │   └── orders/         ✅
│   ├── generated/prisma/   ✅ Prisma v7 generated client
│   ├── hooks/
│   │   └── use-cart.ts     ✅ SWR-based shared cart client state
│   ├── db.ts               ✅ Prisma client singleton (PrismaPg)
│   ├── redis.ts            ✅ ioredis singleton + RedisKeys + RedisTTL
│   ├── types/api.ts        ✅ shared API view types
│   └── utils.ts
├── prisma/
│   └── schema.prisma       ✅ Final schema
├── prisma.config.ts
├── .env
└── package.json
```

---

## ⚙️ Key File Contents

### `lib/auth/index.ts`
```ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { admin as adminPlugin } from "better-auth/plugins"
import { PrismaClient } from "@/lib/generated/prisma/client"
import { ac, admin, customer } from "@/lib/auth/permissions"

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  plugins: [
    adminPlugin({ ac, roles: { admin, customer } }),
  ],
})
```

### `lib/db.ts`
- Uses `PrismaPg` adapter (matches better-auth)
- `globalThis` singleton pattern (prevents hot-reload connection explosion)
- Logs queries in development, errors only in production
- Export: `db`

### `lib/redis.ts`
- ioredis singleton with retry strategy (3 attempts, exponential backoff)
- `RedisKeys` — namespaced key helpers: `guestCart`, `userCart`, `productList`, `product`, `categoryList`
- `RedisTTL` — TTL constants: guest cart 7d, user cart 24h, productList 60s, product 5min, categories 10min
- Exports: `redis`, `RedisKeys`, `RedisTTL`

### `lib/api/response.ts`
- Success: `ok(data, meta?)`, `created(data)`
- Errors: `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `unprocessable`, `serverError`
- Helper: `paginate(total, page, limit)` → `ApiMeta`

### `lib/api/errors.ts`
- `ApiError` class with static constructors: `.badRequest()`, `.unauthorized()`, `.forbidden()`, `.notFound()`, `.conflict()`
- `withErrorHandler(handler)` — wraps route handlers, catches `ApiError`, `ZodError` (uses `.issues` not `.errors` — Zod v4), and Prisma error codes (P2002, P2025, P2003)

### `lib/api/middleware.ts`
- `requireAuth(handler)` — injects `{ session, user }`, throws 401/403
- `requireAdmin(handler)` — injects `{ session, user }`, throws 401/403 if not admin role
- `requirePermission(resource, actions)(handler)` — fine-grained RBAC via `auth.api.userHasPermission`
- All guards check `user.banned` and throw 403 if true

---

## 🔑 Important Implementation Notes

1. **Zod v4** — use `.issues` not `.errors` on `ZodError`. String formats are top-level: `z.email()` not `z.string().email()` (deprecated).

2. **Prisma client** — import from `@/lib/db` as `db`. Never instantiate `PrismaClient` directly in modules.

3. **Redis keys** — always use `RedisKeys.*` helpers, never hardcode strings.

4. **Price fields** — always `Decimal`, never `number`/`float`. Use `parseFloat(price.toString())` only for JSON serialization.

5. **Cart strategy**:
   - Guest cart → Redis only (key: `fluxcart:cart:guest:{sessionId}`)
   - Auth cart → DB (source of truth) + Redis cache (key: `fluxcart:cart:user:{userId}`)
   - Merge on login → `POST /api/cart/merge`
   - Item mutations use `productId`, not `cartItem.id`
   - Storefront client cart state is shared via SWR over `/api/cart`, not custom browser events

6. **Checkout is a Prisma transaction** — stock validation, row lock, decrement, order creation, cart clear, and auth cart cache invalidation — all atomic/consistent at the request level. Use `db.$transaction()` and invalidate `RedisKeys.userCart(userId)` after success.

7. **OrderItem price snapshot** — always copy `product.price`, `product.name`, `product.imageUrls[0]` at time of order. Never reference live product price from order history.

8. **Soft delete products** — set `isActive: false`, never hard delete (breaks order history FK).

9. **better-auth session** — always read via `auth.api.getSession({ headers: await headers() })`. Never trust client-side session for server operations.

10. **`withErrorHandler` + guard composition**:
```ts
export const POST = withErrorHandler(
  requireAdmin(async ({ user }, req: Request) => {
    const body = await req.json()
    const data = CreateProductSchema.parse(body)
    const product = await productService.create(data)
    return created(product)
  })
)
```

---

## ⏭️ What to Build Next

### Priority 1 — Testing
- Add Vitest for service-level tests
- Add Supertest or route-level integration coverage for:
  - guest cart add/update/remove
  - guest-to-user cart merge
  - checkout transaction behavior
  - customer cancel restrictions
  - admin order status update

### Priority 2 — Stack Reconciliation
- Install and wire Vitest + Supertest
- Install and wire Swagger / OpenAPI tooling if it remains a project requirement

### Priority 3 — Documentation Cleanup
- Keep `docs/01-claude-context.md` and `docs/02-working-doc.md` synchronized
- Decide whether this file remains the long-term source of truth or a higher-level architecture doc

### Priority 4 — Route / Structure Cleanup
- Consider splitting slug-read and id-mutate routes into distinct folders for clarity
- Preserve the external API contract if route internals are reorganized

---

## 🚫 Out of Scope (v1)
- Real payment gateway (mock — always succeeds)
- Email notifications (log instead)
- Product reviews
- Discount / coupon codes
- Multi-vendor
- File upload (use URLs)
