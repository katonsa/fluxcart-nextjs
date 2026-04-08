# FluxCart — Product Roadmap

> This document captures the recommended product roadmap for FluxCart based on the current implementation state.
> Use this alongside `docs/02-working-doc.md` and `docs/03-storefront-ui-working-doc.md`.
> If roadmap intent and implementation diverge, prefer the code for current truth and use this file for forward planning.

---

## Purpose

This document records:
- what product capabilities already exist at MVP level
- which feature areas are still missing for a more complete commerce product
- how those features should be sequenced into releases
- which priorities matter most from a product-owner perspective

---

## Product Positioning

FluxCart is currently a backend-focused ecommerce MVP with a working storefront, customer account flows, order lifecycle basics, and admin CRUD for catalog and orders.

The current implementation already covers:
- product catalog browsing
- product search and filtering
- cart and checkout
- customer profile and address management
- customer order history and order detail
- admin dashboard, categories, products, and order management

The next stage is not more MVP plumbing. The next stage is making the product commercially credible and operationally stronger.

---

## Roadmap Principles

- Prioritize features that unblock real commerce operations first
- Protect revenue-critical flows with automated tests before layering on convenience features
- Build customer-facing trust and conversion features after payments and fulfillment are stable
- Expand admin and reporting depth after the order lifecycle is credible end-to-end

---

## Release 1 — Commerce Core

Goal:
Make checkout commercially credible, not just technically complete.

### Payments
- Introduce a real payment flow instead of order creation only
- Add payment method selection during checkout
- Track payment status and payment reference on orders
- Handle failed payments, retries, and asynchronous gateway updates

Why this matters:
- Without payment support, checkout is incomplete for real commerce usage

### Shipping
- Add shipping methods and shipping fees
- Capture selected shipping method on the order
- Support delivery estimate messaging
- Extend admin fulfillment detail for shipment handling

Why this matters:
- Address-only checkout is too thin for realistic order fulfillment

### Order Totals
- Expand pricing from a single total into:
  - subtotal
  - shipping fee
  - discount amount
  - tax placeholder or tax logic
  - final total

Why this matters:
- Customers need clear pricing breakdown before order placement

### Automated Tests for Critical Paths
- Add service and route tests around:
  - cart behavior
  - cart merge
  - checkout
  - order status updates

Why this matters:
- Revenue-critical features should not rely only on lint and typecheck

---

## Release 2 — Conversion and Retention

Goal:
Improve conversion, trust, and repeat purchase behavior.

### Discounts and Promotions
- Add coupon code support
- Support fixed and percentage discounts
- Add admin controls for promo lifecycle and usage rules

Why this matters:
- Promotions are a basic growth lever for ecommerce

### Transactional Notifications
- Send order confirmation notifications
- Send order status change notifications
- Add shipment-related notifications when fulfillment expands

Why this matters:
- Customers need visibility after purchase, not just during checkout

### Reviews and Ratings
- Add product ratings and reviews
- Restrict review creation to appropriate users if needed
- Add moderation capability in admin

Why this matters:
- Reviews improve trust and purchase confidence

### Wishlist / Save for Later
- Allow customers to save products without purchasing immediately
- Support moving items between saved state and cart

Why this matters:
- This helps retain users who are not ready to buy on the first visit

### Reorder Flow
- Let customers add items from past orders back to the cart
- Handle stock-aware reorder behavior

Why this matters:
- Reorder is a strong repeat-purchase feature for returning customers

---

## Release 3 — Merchant Operations

Goal:
Improve admin usefulness for running the store day-to-day.

### Customer Management
- Add customer listing and customer detail views
- Show order history per customer
- Surface support-relevant account context

### Inventory Operations
- Add inventory adjustment history
- Add low-stock visibility or alerting
- Improve auditability for stock changes

### Sales Analytics and Reporting
- Expand beyond top-line dashboard stats
- Add reporting by:
  - date range
  - product
  - category
  - revenue trends
  - average order value

Why this matters:
- CRUD alone is not enough for merchant operations

---

## Release 4 — Platform Readiness

Goal:
Make the product easier to operate, extend, and present professionally.

### API Documentation
- Add OpenAPI / Swagger generation
- Document auth, validation, error shapes, and domain routes

Why this matters:
- This improves developer experience and portfolio value

### Notification Infrastructure
- Formalize notification strategy instead of treating it as optional follow-up
- Keep implementation flexible for email provider changes later

### Documentation Maintenance
- Keep planning, working docs, and implementation docs aligned as features land

---

## Priority Summary

### P0
- payments
- shipping methods and shipping fees
- order total breakdown
- automated tests for cart and checkout flows

### P1
- discounts and coupons
- transactional notifications
- reviews and ratings
- wishlist and save for later
- reorder

### P2
- customer management
- inventory audit and stock alerts
- analytics and reporting
- OpenAPI / Swagger

---

## Recommended Delivery Order

1. Payments
2. Shipping methods and order total breakdown
3. Automated tests for cart, checkout, and orders
4. Discounts and coupons
5. Transactional notifications
6. Reviews and ratings
7. Wishlist and reorder
8. Deeper admin reporting and merchant operations
9. OpenAPI / Swagger

---

## Product-Owner Recommendation

If the goal is a credible commerce application:
- build payments, shipping, and pricing breakdown first

If the goal is also strong portfolio presentation:
- add automated tests immediately after the revenue-critical flow is stable
- then add OpenAPI / Swagger once the route contract has settled

---

## Cross-References

- Current implementation truth: [`docs/02-working-doc.md`](./02-working-doc.md)
- Storefront UI truth: [`docs/03-storefront-ui-working-doc.md`](./03-storefront-ui-working-doc.md)
- Historical project handoff: [`docs/01-claude-context.md`](./01-claude-context.md)
