// @/lib/auth/permissions.ts
import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access"

const statement = {
  ...defaultStatements,
  product: ["create", "update", "delete", "manage-inventory"],
  order: ["read-all", "update-status"],
  category: ["create", "update", "delete"],
} as const

export const ac = createAccessControl(statement)

// Customer — can only do self-service
export const customer = ac.newRole({
  product: [],
  order: [],
  category: [],
})

// Admin — full control
export const admin = ac.newRole({
  ...adminAc.statements,
  product: ["create", "update", "delete", "manage-inventory"],
  order: ["read-all", "update-status"],
  category: ["create", "update", "delete"],
})
