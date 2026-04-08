export const CART_UPDATED_EVENT = "fluxcart:cart-updated"

export function emitCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT))
  }
}
