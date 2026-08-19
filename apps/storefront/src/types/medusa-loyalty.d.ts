import "@medusajs/types/dist/http/cart/store/entities"

declare module "@medusajs/types/dist/http/cart/store/entities" {
  interface StoreCart {
    credit_line_total?: number
  }
}
