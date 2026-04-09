# FluxCart — Storefront UI Working Doc

> This document captures the current state of the customer-facing storefront UI.
> Use this alongside `docs/02-working-doc.md`.
> If this file and the code diverge, prefer the code.

---

## Purpose

This document records:
- which storefront routes currently exist
- what customer-facing flows are actually implemented
- which API-backed capabilities are not yet exposed in the UI
- what should be treated as follow-up work instead of a regression

---

## Current Status

### Storefront Shell
- Storefront pages render through [`app/(storefront)/layout.tsx`](../app/(storefront)/layout.tsx)
- Shared shell includes:
  - [`components/navbar.tsx`](../components/navbar.tsx)
  - [`components/footer.tsx`](../components/footer.tsx)
  - [`components/cart-sheet.tsx`](../components/cart-sheet.tsx)

### Customer Routes Present
- `/` via [`app/(storefront)/page.tsx`](../app/(storefront)/page.tsx)
- `/products` via [`app/(storefront)/products/page.tsx`](../app/(storefront)/products/page.tsx)
- `/products/:slug` via [`app/(storefront)/products/[slug]/page.tsx`](../app/(storefront)/products/[slug]/page.tsx)
- `/categories/:slug` via [`app/(storefront)/categories/[slug]/page.tsx`](../app/(storefront)/categories/[slug]/page.tsx)
- `/cart` via [`app/(storefront)/cart/page.tsx`](../app/(storefront)/cart/page.tsx)
- `/checkout` via [`app/(storefront)/checkout/page.tsx`](../app/(storefront)/checkout/page.tsx)
- `/account` via [`app/(storefront)/account/page.tsx`](../app/(storefront)/account/page.tsx)
- `/account/addresses` via [`app/(storefront)/account/addresses/page.tsx`](../app/(storefront)/account/addresses/page.tsx)
- `/orders` via [`app/(storefront)/orders/page.tsx`](../app/(storefront)/orders/page.tsx)
- `/orders/:id` via [`app/(storefront)/orders/[id]/page.tsx`](../app/(storefront)/orders/[id]/page.tsx)

---

## Implemented UI Flows

### Home
- Home page shows a hero section and category grid
- Category data is loaded from `categoryService.list()`
- CTA paths are live:
  - Browse Products
  - Admin Panel
  - View all categories via `/products`

Current note:
- protected storefront routes now redirect unauthenticated users to `/sign-in?redirectTo=...` before protected client-side fetches run

### Product Browsing
- [`app/(storefront)/products/page.tsx`](../app/(storefront)/products/page.tsx) supports:
  - server-rendered product listing
  - category filtering from `searchParams`
  - product search via `searchParams.search`
  - price range filtering via `searchParams.minPrice` and `searchParams.maxPrice`
  - in-stock-only filtering via `searchParams.inStock`
  - sort selection via `searchParams.sortBy`
  - search form submission from the products page
  - search result count and search-state messaging
  - pagination
  - product count display
  - empty state when no products match
  - stable query preservation through category changes and pagination
- [`app/(storefront)/categories/[slug]/page.tsx`](../app/(storefront)/categories/[slug]/page.tsx) renders a category-specific grid
- [`components/product-card.tsx`](../components/product-card.tsx) is the main reusable browsing card

### Product Detail
- [`app/(storefront)/products/[slug]/page.tsx`](../app/(storefront)/products/[slug]/page.tsx) supports:
  - slug-based server fetch
  - product image display
  - category backlink
  - stock badge
  - add-to-cart CTA
  - description section
- [`components/add-to-cart-button.tsx`](../components/add-to-cart-button.tsx) uses the shared cart hook and toast feedback

### Cart
- Cart UI exists in two customer surfaces:
  - page view: [`app/(storefront)/cart/page.tsx`](../app/(storefront)/cart/page.tsx)
  - slide-over: [`components/cart-sheet.tsx`](../components/cart-sheet.tsx)
- Both surfaces use the shared SWR cart hook in [`lib/hooks/use-cart.ts`](../lib/hooks/use-cart.ts)
- Current cart capabilities:
  - load current cart
  - increment and decrement quantity
  - remove item
  - clear the entire cart from the cart page
  - show subtotal
  - route to checkout
  - show empty-state UI
  - merge guest cart into authenticated cart after successful sign-in or sign-up

### Checkout
- [`app/(storefront)/checkout/page.tsx`](../app/(storefront)/checkout/page.tsx) supports:
  - loading saved addresses
  - selecting a shipping address
  - rendering an order summary from cart state
  - placing an order through `POST /api/orders`
  - refreshing cart state after successful checkout
  - redirecting to order detail page after success

Current caveat:
- checkout still depends on saved addresses existing for a successful order, so the empty state remains the main path to address creation

### Account
- [`app/(storefront)/account/page.tsx`](../app/(storefront)/account/page.tsx) supports:
  - loading profile from `/api/users/me`
  - updating display name
  - changing password through `/api/users/me/password`
  - sign out
  - route-level auth redirect to `/sign-in?redirectTo=/account`

### Address Book
- [`app/(storefront)/account/addresses/page.tsx`](../app/(storefront)/account/addresses/page.tsx) supports:
  - list saved addresses
  - create address in dialog
  - delete address
  - mark address as default
  - route-level auth redirect to `/sign-in?redirectTo=/account/addresses`

### Orders
- [`app/(storefront)/orders/page.tsx`](../app/(storefront)/orders/page.tsx) supports:
  - list order history
  - show order status badges
  - view details for each order
  - route-level auth redirect to `/sign-in?redirectTo=/orders`
- [`app/(storefront)/orders/[id]/page.tsx`](../app/(storefront)/orders/[id]/page.tsx) supports:
  - order detail display
  - item list and shipping address
  - order cancellation for `PENDING` orders
  - shared `AlertDialog` confirmation for cancellation
  - route-level auth redirect to `/sign-in?redirectTo=/orders/:id`

---

## API Capability vs UI Exposure

### Product Search
- Search support exists in the product query layer:
  - [`lib/modules/products/product.schema.ts`](../lib/modules/products/product.schema.ts) defines `search`
  - [`lib/modules/products/product.service.ts`](../lib/modules/products/product.service.ts) filters by product name using case-insensitive `contains`
- Storefront UI exposure now exists:
  - [`components/navbar.tsx`](../components/navbar.tsx) links to `/products?focus=search`
  - [`app/(storefront)/products/page.tsx`](../app/(storefront)/products/page.tsx) reads both `focus` and `search`
  - the products page renders a search input, GET form, and search-aware empty/result messaging
  - category links and pagination preserve the active search query
- Storefront browse and detail pages read services directly on the server rather than calling slug-specific API routes

Conclusion:
- product search is implemented in the query layer and storefront UI
- storefront reads are direct-service reads, not API-fetched reads

### Product Filters
- Current storefront product filtering only exposes category filtering
- API-level params documented elsewhere but not exposed in the listing UI include:
  - none for current public browse controls

Implemented storefront exposure now includes:
- `search`
- `minPrice`
- `maxPrice`
- `inStock`
- `sortBy`

---

## Shared UI Inventory

### Reusable Storefront Components
- [`components/navbar.tsx`](../components/navbar.tsx)
- [`components/footer.tsx`](../components/footer.tsx)
- [`components/cart-sheet.tsx`](../components/cart-sheet.tsx)
- [`components/product-card.tsx`](../components/product-card.tsx)
- [`components/category-card.tsx`](../components/category-card.tsx)
- [`components/add-to-cart-button.tsx`](../components/add-to-cart-button.tsx)
- [`components/order-status-badge.tsx`](../components/order-status-badge.tsx)

### Shared UI Primitives Already Available
- buttons, badges, dialog, input, label, sheet, table, textarea, tooltip
- alert dialog is available in [`components/ui/alert-dialog.tsx`](../components/ui/alert-dialog.tsx)

This means several missing storefront interactions can likely be built without introducing new base primitives.

---

## Known Gaps

These should be treated as planned follow-up, not as hidden regressions.

### Protected-Route UX
- protected storefront routes now redirect at the route boundary, but they still rely on a shared sign-in page rather than route-specific explanatory empty states

### API Surface
- the storefront no longer depends on the explicit `by-slug` API routes or the standalone product inventory endpoint

---

## Recommended Next Tasks

1. Decide whether protected storefront routes should keep redirecting to shared sign-in, or add route-specific unauthenticated explainer states for checkout and orders.
2. Improve failure-state messaging inside protected pages for non-auth API errors such as suspended accounts or missing order records.

---

## Operational Notes

- If storefront behavior changes, update this file and `docs/02-working-doc.md` together
- If product discovery changes, verify all three layers together:
  - `/api/products` query contract
  - `productService.list(...)`
  - storefront browse/search/filter UI
- If cart behavior changes, verify both the cart page and the cart sheet because they share the same SWR-backed cart source
