"use client"

import { Link, useConfig } from "@payloadcms/ui"
import { formatAdminURL } from "payload/shared"
import { usePathname } from "next/navigation"

export function WhatsNewNavLink() {
  const pathname = usePathname()
  const {
    config: {
      routes: { admin },
    },
  } = useConfig()
  const href = formatAdminURL({
    adminRoute: admin,
    path: "/whats-new",
  })
  const isActive = pathname === href

  return (
    <div style={{ marginTop: "calc(var(--base) * .5)" }}>
      <Link
        href={href}
        style={{
          alignItems: "center",
          background: isActive ? "var(--theme-elevation-150)" : "transparent",
          borderRadius: "var(--style-radius-s)",
          color: "var(--theme-text)",
          display: "flex",
          fontSize: "13px",
          lineHeight: "20px",
          padding: "calc(var(--base) * .33) calc(var(--base) * .5)",
          textDecoration: "none",
        }}
      >
        更新内容
      </Link>
    </div>
  )
}
