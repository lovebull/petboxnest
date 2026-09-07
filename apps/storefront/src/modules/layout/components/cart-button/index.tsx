"use client"

import CartDropdown from "../cart-dropdown"
import { useLayoutSession } from "../layout-session-provider"

export default function CartButton() {
  const { cart } = useLayoutSession()

  return <CartDropdown cart={cart} />
}
