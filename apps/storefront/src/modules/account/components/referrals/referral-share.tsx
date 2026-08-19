"use client"

import { Button, Input, Text } from "@modules/common/components/ui"
import { useState } from "react"

export default function ReferralShare({
  code,
  countryCode,
  configuredOrigin,
}: {
  code: string
  countryCode: string
  configuredOrigin: string
}) {
  const [copied, setCopied] = useState(false)
  const origin = configuredOrigin || (typeof window !== "undefined" ? window.location.origin : "")
  const link = `${origin}/${countryCode}/r/${code}`

  const copy = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <Text className="mb-2 text-small-regular text-ui-fg-subtle">
        Your referral link
      </Text>
      <div className="flex flex-col gap-3 small:flex-row">
        <Input value={link} readOnly aria-label="Your referral link" />
        <Button type="button" variant="secondary" onClick={copy}>
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </div>
  )
}
