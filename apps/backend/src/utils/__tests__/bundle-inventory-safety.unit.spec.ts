import {
  getPackInventoryError,
  hasDuplicateInventoryItems,
  inventoryLinkAction,
} from "../../../../bundle-offers-plugin/src/utils/inventory-safety"

const item = (quantity: number) => ({inventory_item_id: "shared-stock", required_quantity: quantity})

describe("bundle pack inventory safety", () => {
  it.each([3, 5])("rejects under-counts for a %i-unit pack, including gifts", (count) => {
    expect(getPackInventoryError({pack_quantity: count}, [item(count)], [item(1)])).not.toBeNull()
    expect(getPackInventoryError({pack_quantity: count}, [item(count)], [item(count - 1)])).not.toBeNull()
    expect(getPackInventoryError({pack_quantity: count}, [item(count)], [item(count)])).toBeNull()
  })
  it("rejects clearing or replacing the shared inventory of a fixed pack", () => {
    expect(getPackInventoryError({pack_quantity: 3}, [item(3)], [])).not.toBeNull()
    expect(getPackInventoryError({pack_quantity: 3}, [item(3)], [{...item(3), inventory_item_id:"different-stock"}])).not.toBeNull()
  })
  it("allows a correct offer to repair a drifted native link", () => {
    expect(getPackInventoryError({pack_quantity: 5}, [item(1)], [item(5)])).toBeNull()
    expect(inventoryLinkAction(1, 5)).toBe("update")
    expect(inventoryLinkAction(5, 5)).toBeNull()
  })
  it("recreates a missing link for a generic kit", () => {
    expect(inventoryLinkAction(undefined, 3)).toBe("create")
  })
  it("rejects invalid fixed-pack metadata", () => {
    for (const count of [0, -1, 1.5, "3"]) expect(getPackInventoryError({pack_quantity: count}, [item(3)], [item(3)])).not.toBeNull()
  })
  it("does not impose fixed-pack rules on generic multi-item kits", () => {
    expect(getPackInventoryError(null, [], [item(2), {...item(1), inventory_item_id: "gift-stock"}])).toBeNull()
  })
  it("detects paid and free rows that would overwrite the same inventory link", () => {
    expect(hasDuplicateInventoryItems([item(2), item(1)])).toBe(true)
    expect(hasDuplicateInventoryItems([item(3)])).toBe(false)
  })
})
