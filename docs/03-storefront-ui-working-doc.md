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

Current caveat:
- [`app/(storefront)/page.tsx`](../app/(storefront)/page.tsx) still contains a comment that categories are a placeholder, but categories are already wired and rendered

### Product Browsing
- [`app/(storefront)/products/page.tsx`](../app/(storefront)/products/page.tsx) supports:
  - server-rendered product listing
  - category filtering from `searchParams`
  - pagination
  - product count display
  - empty state when no products match
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
  - show subtotal
  - route to checkout
  - show empty-state UI

### Checkout
- [`app/(storefront)/checkout/page.tsx`](../app/(storefront)/checkout/page.tsx) supports:
  - loading saved addresses
  - selecting a shipping address
  - rendering an order summary from cart state
  - placing an order through `POST /api/orders`
  - refreshing cart state after successful checkout
  - redirecting to order detail page after success

Current caveat:
- checkout assumes signed-in access for address loading and order placement, but the page currently enforces this through runtime fetch behavior rather than a clearer route-level guard/UI state

### Account
- [`app/(storefront)/account/page.tsx`](../app/(storefront)/account/page.tsx) supports:
  - loading profile from `/api/users/me`
  - updating display name
  - sign out
  - redirect to `/sign-in` if session lookup fails

### Address Book
- [`app/(storefront)/account/addresses/page.tsx`](../app/(storefront)/account/addresses/page.tsx) supports:
  - list saved addresses
  - create address in dialog
  - delete address
  - mark address as default

Current caveat:
- address deletion still uses native `confirm()` instead of the shared alert dialog pattern

### Orders
- [`app/(storefront)/orders/page.tsx`](../app/(storefront)/orders/page.tsx) supports:
  - list order history
  - show order status badges
  - view details for each order
- [`app/(storefront)/orders/[id]/page.tsx`](../app/(storefront)/orders/[id]/page.tsx) supports:
  - order detail display
  - item list and shipping address
  - order cancellation for `PENDING` orders
  - shared `AlertDialog` confirmation for cancellation

---

## API Capability vs UI Exposure

### Product Search
- API support exists:
  - [`lib/modules/products/product.schema.ts`](../lib/modules/products/product.schema.ts) defines `search`
  - [`lib/modules/products/product.service.ts`](../lib/modules/products/product.service.ts) filters by product name using case-insensitive `contains`
  - [`app/api/products/route.ts`](../app/api/products/route.ts) passes query params through to the product service
- Storefront UI exposure does not exist yet:
  - [`components/navbar.tsx`](../components/navbar.tsx) links to `/products?focus=search`
  - [`app/(storefront)/products/page.tsx`](../app/(storefront)/products/page.tsx) ignores `focus`
  - [`app/(storefront)/products/page.tsx`](../app/(storefront)/products/page.tsx) does not read `search`
  - there is no search input field, search form, or search results messaging in the product listing UI

Conclusion:
- product search is implemented at the API level
- product search is not currently implemented in the storefront UI

### Product Filters
- Current storefront product filtering only exposes category filtering
- API-level params documented elsewhere but not exposed in the listing UI include:
  - `search`
  - `minPrice`
  - `maxPrice`
  - `inStock`
  - `sortBy` beyond the default service behavior

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

### Missing Search UI
- API supports product search
- navbar visually implies search exists
- storefront listing page does not render a search field or bind a `search` query param

### Missing Filter/Sort Controls
- products page only exposes category filtering
- there is no UI for price range, stock filtering, or sort selection

### Native Confirm Still Present in Address Book
- [`app/(storefront)/account/addresses/page.tsx`](../app/(storefront)/account/addresses/page.tsx) still uses `confirm("Delete this address?")`

### Auth UX Could Be Clearer
- account and checkout flows depend on runtime redirects or failed fetches
- storefront does not yet provide a consistent customer-auth gate or dedicated unauthenticated empty state for protected pages

### Product Listing Query-State Support Is Partial
- `/products` preserves `category` during pagination
- it does not preserve future search/filter params because they are not yet part of the page state model

### Copy / Documentation Drift
- home page still contains a stale “placeholder until categories API is wired” comment
- navbar search link currently over-promises behavior by pointing to `?focus=search` with no matching page implementation

---

## Recommended Next Tasks

1. Implement storefront product search on [`app/(storefront)/products/page.tsx`](../app/(storefront)/products/page.tsx) using the existing `search` API parameter.
2. Replace native address deletion confirm with [`components/ui/alert-dialog.tsx`](../components/ui/alert-dialog.tsx).
3. Add explicit sort and filter controls to the products page and keep query params stable through pagination.
4. Tighten storefront auth UX for `/account`, `/account/addresses`, `/checkout`, `/orders`, and `/orders/:id`.
5. Remove stale placeholder comments and misleading UI affordances after the above behavior is implemented.

---

## Operational Notes

- If storefront behavior changes, update this file and `docs/02-working-doc.md` together
- If product discovery changes, verify all three layers together:
  - `/api/products` query contract
  - `productService.list(...)`
  - storefront browse/search/filter UI
- If cart behavior changes, verify both the cart page and the cart sheet because they share the same SWR-backed cart source
