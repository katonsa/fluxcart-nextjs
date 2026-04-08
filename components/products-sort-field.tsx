"use client"

import { useState } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ProductSort = "newest" | "price_asc" | "price_desc"

interface ProductsSortFieldProps {
  defaultValue: ProductSort
  options: { value: ProductSort; label: string }[]
}

export function ProductsSortField({
  defaultValue,
  options,
}: ProductsSortFieldProps) {
  const [value, setValue] = useState<ProductSort>(defaultValue)

  return (
    <>
      <input type="hidden" name="sortBy" value={value} />
      <Select value={value} onValueChange={(nextValue) => setValue(nextValue as ProductSort)}>
        <SelectTrigger id="products-sort" className="w-full">
          <SelectValue placeholder="Sort products" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
