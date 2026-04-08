"use client"

import { useCallback } from "react"
import useSWR from "swr"
import { useSWRConfig } from "swr"
import type { ApiResponse, CartView } from "@/lib/types/api"

export const CART_SWR_KEY = "/api/cart"

interface UseCartOptions {
  eager?: boolean
}

async function readCartResponse(res: Response) {
  const data = (await res.json()) as ApiResponse<CartView>

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to load cart")
  }

  return data.data
}

async function fetchCart() {
  const res = await fetch(CART_SWR_KEY)
  return readCartResponse(res)
}

export function useCart(options: UseCartOptions = {}) {
  const { eager = false } = options
  const { mutate: globalMutate } = useSWRConfig()

  const cartState = useSWR<CartView>(
    CART_SWR_KEY,
    fetchCart,
    eager
      ? undefined
      : {
          revalidateOnMount: false,
          revalidateIfStale: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
        },
  )

  const setCart = useCallback(async (nextCart: CartView) => {
    await globalMutate(CART_SWR_KEY, nextCart, { revalidate: false })
    return nextCart
  }, [globalMutate])

  const refreshCart = useCallback(async () => {
    const nextCart = await fetchCart()
    await globalMutate(CART_SWR_KEY, nextCart, { revalidate: false })
    return nextCart
  }, [globalMutate])

  const addItem = useCallback(async (productId: string, quantity: number) => {
    const res = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    })

    return setCart(await readCartResponse(res))
  }, [setCart])

  const updateItem = useCallback(async (productId: string, quantity: number) => {
    const res = await fetch(`/api/cart/items/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    })

    return setCart(await readCartResponse(res))
  }, [setCart])

  const removeItem = useCallback(async (productId: string) => {
    const res = await fetch(`/api/cart/items/${productId}`, {
      method: "DELETE",
    })

    return setCart(await readCartResponse(res))
  }, [setCart])

  return {
    cart: cartState.data ?? null,
    error: cartState.error,
    isLoading: cartState.isLoading,
    refreshCart,
    addItem,
    updateItem,
    removeItem,
  }
}
