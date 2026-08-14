import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import { Button, Container, Heading, Input, Label, Text } from "@medusajs/ui"
import { FormEvent, useState } from "react"

const ProductAmazonUrlWidget = ({
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const initialValue =
    typeof data.metadata?.amazon_url === "string"
      ? data.metadata.amazon_url
      : ""

  const [amazonUrl, setAmazonUrl] = useState(initialValue)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage(null)
    setError(null)

    const value = amazonUrl.trim()

    try {
      const response = await fetch(`/admin/products/${data.id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: {
            amazon_url: value,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save Amazon URL.")
      }

      setMessage(value ? "Amazon URL saved." : "Amazon URL removed.")
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save Amazon URL."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Go to Amazon</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Save the Amazon URL used by the storefront product button.
          </Text>
        </div>
      </div>
      <form className="flex flex-col gap-y-4 px-6 py-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="product-amazon-url">Amazon URL</Label>
          <Input
            id="product-amazon-url"
            name="amazon_url"
            placeholder="https://www.amazon.com/dp/..."
            value={amazonUrl}
            onChange={(event) => setAmazonUrl(event.target.value)}
          />
        </div>
        <div className="flex items-center justify-between gap-x-4">
          <Text className="text-ui-fg-subtle" size="small">
            Metadata key: amazon_url
          </Text>
          <Button type="submit" size="small" isLoading={isSaving}>
            Save Amazon URL
          </Button>
        </div>
        {message && (
          <Text className="text-ui-fg-success" size="small">
            {message}
          </Text>
        )}
        {error && (
          <Text className="text-ui-fg-error" size="small">
            {error}
          </Text>
        )}
      </form>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details",
  id: "larumsport-product-amazon-url",
})

export default ProductAmazonUrlWidget
