import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types";
import { PencilSquare } from "@medusajs/icons";
import {
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Text,
} from "@medusajs/ui";
import { FormEvent, useState } from "react";

import { sdk } from "../lib/sdk";

type SupplierUrlKey =
  "supplier_1688_url" | "supplier_taobao_url" | "supplier_jd_url";

type SupplierUrls = Record<SupplierUrlKey, string>;

const supplierFields: Array<{
  key: SupplierUrlKey;
  label: string;
  placeholder: string;
}> = [
  {
    key: "supplier_1688_url",
    label: "1688 采购地址 / 1688 Supplier URL",
    placeholder: "https://detail.1688.com/offer/...",
  },
  {
    key: "supplier_taobao_url",
    label: "淘宝采购地址 / Taobao Supplier URL",
    placeholder: "https://item.taobao.com/item.htm?...",
  },
  {
    key: "supplier_jd_url",
    label: "京东采购地址 / JD Supplier URL",
    placeholder: "https://item.jd.com/...",
  },
];

const getMetadataUrl = (
  metadata: AdminProduct["metadata"],
  key: SupplierUrlKey,
) => (typeof metadata?.[key] === "string" ? metadata[key] : "");

const getInitialSupplierUrls = (
  metadata: AdminProduct["metadata"],
): SupplierUrls => ({
  supplier_1688_url: getMetadataUrl(metadata, "supplier_1688_url"),
  supplier_taobao_url: getMetadataUrl(metadata, "supplier_taobao_url"),
  supplier_jd_url: getMetadataUrl(metadata, "supplier_jd_url"),
});

const getSafeExternalUrl = (value: string) => {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};

const ProductSupplierUrlsWidget = ({
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const initialSupplierUrls = getInitialSupplierUrls(data.metadata);
  const [savedSupplierUrls, setSavedSupplierUrls] =
    useState<SupplierUrls>(initialSupplierUrls);
  const [draftSupplierUrls, setDraftSupplierUrls] =
    useState<SupplierUrls>(initialSupplierUrls);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraftSupplierUrls(savedSupplierUrls);
      setError(null);
    }

    setIsOpen(open);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const metadata = {
      ...(data.metadata || {}),
    } as Record<string, unknown>;
    const normalizedSupplierUrls = { ...draftSupplierUrls };

    for (const { key } of supplierFields) {
      const value = draftSupplierUrls[key].trim();
      normalizedSupplierUrls[key] = value;

      if (value) {
        metadata[key] = value;
      } else {
        delete metadata[key];
      }
    }

    try {
      await sdk.admin.product.update(data.id, { metadata });
      setSavedSupplierUrls(normalizedSupplierUrls);
      setMessage("供应商地址已保存。 / Supplier URLs saved.");
      setIsOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "保存供应商地址失败。 / Failed to save supplier URLs.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-start justify-between gap-x-4 px-6 py-4">
          <div>
            <Heading level="h2">采购供应商地址</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Supplier purchasing links
            </Text>
          </div>
          <Button
            onClick={() => handleOpenChange(true)}
            size="small"
            variant="secondary"
          >
            <PencilSquare />
            编辑 / Edit
          </Button>
        </div>

        <div className="flex flex-col gap-y-4 px-6 py-4">
          <div>
            <Text className="text-ui-fg-subtle" size="small">
              保存商品在 1688、淘宝和京东的内部采购来源，不会显示在 Storefront。
            </Text>
            <Text className="text-ui-fg-subtle" size="small">
              Internal sourcing links for this product. These links are not
              shown on the Storefront.
            </Text>
          </div>

          <div className="flex flex-col gap-y-3">
            {supplierFields.map(({ key, label }) => {
              const value = savedSupplierUrls[key];
              const safeUrl = getSafeExternalUrl(value);

              return (
                <div
                  className="flex items-center justify-between gap-x-4"
                  key={key}
                >
                  <Text size="small" weight="plus">
                    {label}
                  </Text>
                  {safeUrl ? (
                    <a
                      className="max-w-[50%] truncate text-ui-fg-interactive txt-compact-small-plus hover:underline"
                      href={safeUrl}
                      rel="noreferrer"
                      target="_blank"
                      title={value}
                    >
                      打开 / Open
                    </a>
                  ) : (
                    <Text className="text-ui-fg-muted" size="small">
                      未设置 / Not set
                    </Text>
                  )}
                </div>
              );
            })}
          </div>

          {message && (
            <Text className="text-ui-fg-success" size="small">
              {message}
            </Text>
          )}
        </div>
      </Container>

      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <Drawer.Content>
          <form className="flex h-full flex-col" onSubmit={handleSubmit}>
            <Drawer.Header>
              <Drawer.Title>编辑采购供应商地址</Drawer.Title>
              <Drawer.Description>
                Edit supplier purchasing links
              </Drawer.Description>
            </Drawer.Header>

            <Drawer.Body className="flex-1 overflow-auto p-4">
              <div className="flex flex-col gap-y-5">
                {supplierFields.map(({ key, label, placeholder }) => (
                  <div className="flex flex-col gap-y-2" key={key}>
                    <Label htmlFor={`product-${key}`}>{label}</Label>
                    <Input
                      id={`product-${key}`}
                      name={key}
                      placeholder={placeholder}
                      type="url"
                      value={draftSupplierUrls[key]}
                      onChange={(event) =>
                        setDraftSupplierUrls((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                    />
                    <Text className="text-ui-fg-subtle" size="xsmall">
                      Metadata key: {key}
                    </Text>
                  </div>
                ))}

                {error && (
                  <Text className="text-ui-fg-error" size="small">
                    {error}
                  </Text>
                )}
              </div>
            </Drawer.Body>

            <Drawer.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Drawer.Close asChild>
                  <Button size="small" type="button" variant="secondary">
                    取消 / Cancel
                  </Button>
                </Drawer.Close>
                <Button type="submit" size="small" isLoading={isSaving}>
                  保存 / Save
                </Button>
              </div>
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer>
    </>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details",
  id: "petboxnest-product-supplier-urls",
});

export default ProductSupplierUrlsWidget;
