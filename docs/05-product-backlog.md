# FluxCart — Product Backlog

> This document translates the roadmap into a delivery-oriented backlog.
> Use this alongside `docs/04-product-roadmap.md`.
> If implementation starts and scope shifts, update this file so priority and delivery intent stay explicit.

---

## Purpose

This document records:
- the prioritized feature backlog
- product value and release mapping
- key user stories
- acceptance criteria for the highest-priority work
- a suggested sprint-level delivery sequence

---

## Prioritized Backlog

| ID | Feature | Business Value | Priority | Phase |
|---|---|---:|---|---|
| F-01 | Payment gateway integration | Enables real monetization | P0 | Release 1 |
| F-02 | Payment status and failure handling | Prevents broken order states | P0 | Release 1 |
| F-03 | Shipping methods and fees | Makes checkout realistic | P0 | Release 1 |
| F-04 | Order total breakdown | Improves checkout clarity | P0 | Release 1 |
| F-05 | Checkout and order automated tests | Reduces regression risk | P0 | Release 1 |
| F-06 | Coupon and discount engine | Drives conversion | P1 | Release 2 |
| F-07 | Transactional notifications | Improves trust and support | P1 | Release 2 |
| F-08 | Reviews and ratings | Increases product trust | P1 | Release 2 |
| F-09 | Wishlist / save for later | Improves retention | P1 | Release 2 |
| F-10 | Reorder from past orders | Improves repeat purchases | P1 | Release 2 |
| F-11 | Customer management in admin | Improves operations | P2 | Release 3 |
| F-12 | Inventory audit and low-stock alerts | Improves stock control | P2 | Release 3 |
| F-13 | Sales analytics and reporting | Improves business insight | P2 | Release 3 |
| F-14 | OpenAPI / Swagger docs | Improves developer experience and portfolio value | P2 | Release 4 |

---

## Top User Stories

### F-01 — Payment Gateway Integration

User story:
As a customer, I want to pay securely so I can complete my order.

Acceptance criteria:
- checkout supports selecting a payment method
- successful payment marks the order as paid or payment-complete
- failed payment does not leave the order in a misleading successful state
- payment reference data is stored for traceability

### F-03 — Shipping Methods and Fees

User story:
As a customer, I want to choose a shipping option so I understand delivery cost and speed.

Acceptance criteria:
- checkout shows at least two shipping options
- selected shipping method affects the final total
- shipping choice is stored on the order
- admin order detail shows the selected shipping method

### F-04 — Order Total Breakdown

User story:
As a customer, I want to see subtotal, shipping, discount, and total before placing my order.

Acceptance criteria:
- checkout displays subtotal, shipping fee, discount, and final total
- order detail page shows the same pricing breakdown
- admin order detail shows the same pricing breakdown
- totals remain consistent after order creation

### F-06 — Coupon and Discount Engine

User story:
As a customer, I want to apply a coupon code to reduce my order total.

Acceptance criteria:
- valid coupons apply the correct discount
- invalid or expired coupons return a clear error
- coupons support at least expiration and active/inactive status
- applied discounts are reflected in the final order total

### F-08 — Reviews and Ratings

User story:
As a shopper, I want to read reviews so I can judge product quality before buying.

Acceptance criteria:
- product detail pages show average rating and review list
- authenticated customers can submit a review
- admin can moderate or remove inappropriate reviews
- review data is linked to the correct product

---

## Suggested Sprint Plan

### Sprint 1
- F-01 Payment gateway integration
- F-02 Payment status and failure handling
- F-05 Checkout and order automated tests

### Sprint 2
- F-03 Shipping methods and fees
- F-04 Order total breakdown

### Sprint 3
- F-06 Coupon and discount engine
- F-07 Transactional notifications

### Sprint 4
- F-08 Reviews and ratings
- F-09 Wishlist / save for later
- F-10 Reorder from past orders

### Sprint 5
- F-11 Customer management in admin
- F-12 Inventory audit and low-stock alerts
- F-13 Sales analytics and reporting

### Sprint 6
- F-14 OpenAPI / Swagger docs

---

## Delivery Notes

- `F-01` through `F-05` should be treated as the minimum next milestone
- revenue-critical work should land with automated coverage, not just manual verification
- pricing, payment, and fulfillment data should be designed together to avoid repeated schema churn
- avoid starting reviews, wishlist, or analytics before checkout is commercially credible

---

## Cross-References

- Roadmap: [`docs/04-product-roadmap.md`](./04-product-roadmap.md)
- Current implementation truth: [`docs/02-working-doc.md`](./02-working-doc.md)
- Storefront UI truth: [`docs/03-storefront-ui-working-doc.md`](./03-storefront-ui-working-doc.md)
