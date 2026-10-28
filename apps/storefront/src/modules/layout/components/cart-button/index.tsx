"use client"

import CartDropdown from "../cart-dropdown"
import { useLayoutSession } from "../layout-session-provider"

export default function CartButton() {
  const { cart, hydrated } = useLayoutSession()

  return <CartDropdown cart={hydrated ? cart : null} />
}
