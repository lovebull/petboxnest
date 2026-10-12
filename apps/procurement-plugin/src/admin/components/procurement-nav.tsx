import { Button } from "@medusajs/ui"
import { Link, useLocation } from "react-router-dom"

const links = [
  { to: "/procurement", label: "采购单 / Orders" },
  { to: "/procurement/suppliers", label: "供应商 / Suppliers" },
  { to: "/procurement/analytics", label: "统计 / Analytics" },
]

export const ProcurementNav = () => {
  const location = useLocation()
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Button
          key={link.to}
          size="small"
          variant={location.pathname === link.to ? "primary" : "secondary"}
          asChild
        >
          <Link to={link.to}>{link.label}</Link>
        </Button>
      ))}
    </div>
  )
}
