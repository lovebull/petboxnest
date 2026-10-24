export type InventoryRequirement = {
  inventory_item_id: string
  required_quantity: number
}

// pack_quantity describes the total shipped units, including free units.
// It is set on fixed-size, shared-inventory pack variants, not generic kits.
export function getPackInventoryError(
  metadata: Record<string, unknown> | null | undefined,
  nativeItems: InventoryRequirement[],
  components: InventoryRequirement[]
): string | null {
  const count = metadata?.pack_quantity
  if (count == null) return null
  if (typeof count !== "number" || !Number.isInteger(count) || count < 1) {
    return "包装发货数量无效 / Invalid pack quantity"
  }
  if (
    nativeItems.length !== 1 || components.length !== 1 ||
    components[0].inventory_item_id !== nativeItems[0].inventory_item_id ||
    components[0].required_quantity !== count
  ) {
    return `此包装每份必须从原库存项扣减 ${count} 件（含赠送件） / This pack must consume ${count} units from its original inventory item, including free units`
  }
  return null
}

export function hasDuplicateInventoryItems(components: InventoryRequirement[]) {
  return new Set(components.map((item) => item.inventory_item_id)).size !== components.length
}

export function inventoryLinkAction(
  actualQuantity: number | undefined,
  requiredQuantity: number
): "create" | "update" | null {
  if (actualQuantity === undefined) return "create"
  return actualQuantity === requiredQuantity ? null : "update"
}
