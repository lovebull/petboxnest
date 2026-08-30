import {
  PayloadRichTextNode,
  ProductEnhancement as ProductEnhancementType,
} from "@lib/data/payload-product-enhancements"
import type React from "react"

type ProductEnhancementProps = {
  enhancement: ProductEnhancementType | null
}

function renderTextNode(
  node: PayloadRichTextNode,
  key: string
): React.ReactNode {
  let content: React.ReactNode = node.text || ""

  if (typeof node.format === "number") {
    if (node.format & 1) {
      content = <strong>{content}</strong>
    }
    if (node.format & 2) {
      content = <em>{content}</em>
    }
    if (node.format & 8) {
      content = <u>{content}</u>
    }
    if (node.format & 16) {
      content = <code>{content}</code>
    }
  }

  return <span key={key}>{content}</span>
}

function renderRichTextChildren(
  nodes?: PayloadRichTextNode[]
): React.ReactNode[] | undefined {
  return nodes?.map((node, index) => renderRichTextNode(node, `${index}`))
}

function getTextAlignClass(format?: string | number) {
  if (format === "center") {
    return "text-center"
  }

  if (format === "right" || format === "end") {
    return "text-right"
  }

  return ""
}

function getMediaAlignClass(format?: string | number) {
  if (format === "center") {
    return "justify-center"
  }

  if (format === "right" || format === "end") {
    return "justify-end"
  }

  return "justify-start"
}

function renderRichTextNode(
  node: PayloadRichTextNode,
  key: string
): React.ReactNode {
  const children: React.ReactNode[] | undefined = renderRichTextChildren(
    node.children
  )
  const textAlignClass = getTextAlignClass(node.format)

  switch (node.type) {
    case "text":
      return renderTextNode(node, key)
    case "linebreak":
      return <br key={key} />
    case "heading": {
      const Tag = node.tag === "h3" ? "h3" : "h2"

      return (
        <Tag
          key={key}
          className={`mt-8 text-2xl-semi text-ui-fg-base first:mt-0 ${textAlignClass}`}
        >
          {children}
        </Tag>
      )
    }
    case "paragraph":
      return (
        <p
          key={key}
          className={`mt-4 text-base-regular leading-7 text-ui-fg-subtle first:mt-0 ${textAlignClass}`}
        >
          {children}
        </p>
      )
    case "quote":
      return (
        <blockquote
          key={key}
          className={`mt-6 border-l-2 border-ui-border-strong pl-5 text-base-regular leading-7 text-ui-fg-subtle ${textAlignClass}`}
        >
          {children}
        </blockquote>
      )
    case "list": {
      const ListTag = node.listType === "number" ? "ol" : "ul"
      const listClass =
        node.listType === "number"
          ? "list-decimal pl-6"
          : "list-disc pl-6"

      return (
        <ListTag
          key={key}
          className={`mt-4 space-y-2 text-base-regular leading-7 text-ui-fg-subtle ${listClass} ${textAlignClass}`}
        >
          {children}
        </ListTag>
      )
    }
    case "listitem":
      return <li key={key}>{children}</li>
    case "link": {
      const href = typeof node.url === "string" ? node.url : "#"

      return (
        <a
          key={key}
          href={href}
          className="text-ui-fg-base underline underline-offset-4"
          rel={href.startsWith("http") ? "noreferrer" : undefined}
          target={href.startsWith("http") ? "_blank" : undefined}
        >
          {children}
        </a>
      )
    }
    case "upload": {
      const media = typeof node.value === "object" ? node.value : null

      if (!media?.url) {
        return null
      }

      return (
        <figure key={key} className={`mt-8 flex ${getMediaAlignClass(node.format)}`}>
          <img
            src={media.url}
            alt={node.fields?.alt || media.alt || ""}
            width={media.width}
            height={media.height}
            className="h-auto max-w-full"
            loading="lazy"
          />
        </figure>
      )
    }
    default:
      return children?.length ? <div key={key}>{children}</div> : null
  }
}

function ProductRichText({
  content,
}: {
  content: ProductEnhancementType["content"]
}) {
  const children = content?.root?.children

  if (!children?.length) {
    return null
  }

  return (
    <div className="mt-10 max-w-4xl">
      {children.map((node, index) => renderRichTextNode(node, `${index}`))}
    </div>
  )
}

const ProductEnhancement = ({ enhancement }: ProductEnhancementProps) => {
  if (!enhancement) {
    return null
  }

  const highlights =
    enhancement.highlights?.filter(
      (highlight) => highlight.label || highlight.description
    ) || []
  const storySections =
    enhancement.story_sections?.filter(
      (section) => section.heading || section.body || section.image?.url
    ) || []
  const imageBlocks =
    enhancement.image_blocks?.filter(
      (block) => block.image?.url || block.title || block.description
    ) || []
  const specifications =
    enhancement.specifications?.filter((spec) => spec.label || spec.value) || []
  const hasContent = Boolean(enhancement.content?.root?.children?.length)
  const hasHighlights = Boolean(highlights.length)
  const hasSections = Boolean(storySections.length)
  const hasImageBlocks = Boolean(imageBlocks.length)
  const hasSpecs = Boolean(specifications.length)

  if (
    !hasContent &&
    !hasHighlights &&
    !hasSections &&
    !hasImageBlocks &&
    !hasSpecs &&
    !enhancement.care_notes
  ) {
    return null
  }

  return (
    <section className="content-container my-16 small:my-24">
      <div className="border-t border-ui-border-base pt-10">
        {(enhancement.hero_eyebrow || enhancement.subtitle) && (
          <div className="max-w-3xl">
            {enhancement.hero_eyebrow && (
              <p className="text-small-semi uppercase text-ui-fg-muted">
                {enhancement.hero_eyebrow}
              </p>
            )}
            {enhancement.subtitle && (
              <p className="mt-3 text-xl-regular text-ui-fg-base">
                {enhancement.subtitle}
              </p>
            )}
          </div>
        )}

        <ProductRichText content={enhancement.content} />

        {hasHighlights && (
          <div className="mt-10 grid gap-6 small:grid-cols-3">
            {highlights.map((highlight, index) => (
              <div
                key={`${highlight.label || "highlight"}-${index}`}
                className="border-t border-ui-border-base pt-5"
              >
                {highlight.label && (
                  <h2 className="text-base-semi text-ui-fg-base">
                    {highlight.label}
                  </h2>
                )}
                {highlight.description && (
                  <p className="mt-2 text-base-regular text-ui-fg-subtle">
                    {highlight.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {hasSections && (
          <div className="mt-12 grid gap-10">
            {storySections.map((section, index) => {
              const imageOnRight = section.image_position === "right"

              return (
                <article
                  key={`${section.heading || "section"}-${index}`}
                  className="grid gap-6 small:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] small:items-center"
                >
                  {section.image?.url && (
                    <img
                      src={section.image.url}
                      alt={section.image.alt || section.heading || ""}
                      width={section.image.width}
                      height={section.image.height}
                      className={`h-auto max-w-full ${
                        imageOnRight ? "small:order-2" : ""
                      }`}
                      loading="lazy"
                    />
                  )}
                  <div className={imageOnRight ? "small:order-1" : ""}>
                    {section.heading && (
                      <h2 className="text-2xl-semi text-ui-fg-base">
                        {section.heading}
                      </h2>
                    )}
                    {section.body && (
                      <p className="mt-4 whitespace-pre-line text-base-regular text-ui-fg-subtle">
                        {section.body}
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {hasImageBlocks && (
          <div className="mt-12 grid gap-8 border-t border-ui-border-base pt-8 small:grid-cols-3">
            {imageBlocks.map((block, index) => (
              <figure key={`${block.title || "image"}-${index}`}>
                {block.image?.url && (
                  <img
                    src={block.image.url}
                    alt={block.image.alt || block.title || ""}
                    width={block.image.width}
                    height={block.image.height}
                    className="mx-auto h-auto max-w-full"
                    loading="lazy"
                  />
                )}
                {(block.title || block.description) && (
                  <figcaption className="mt-4">
                    {block.title && (
                      <h2 className="text-base-semi text-ui-fg-base">
                        {block.title}
                      </h2>
                    )}
                    {block.description && (
                      <p className="mt-2 whitespace-pre-line text-base-regular text-ui-fg-subtle">
                        {block.description}
                      </p>
                    )}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        {(hasSpecs || enhancement.care_notes || enhancement.video_url) && (
          <div className="mt-12 grid gap-8 border-t border-ui-border-base pt-8 small:grid-cols-2">
            {hasSpecs && (
              <div>
                <h2 className="text-base-semi text-ui-fg-base">
                  Product details
                </h2>
                <dl className="mt-4 grid gap-3">
                  {specifications.map((spec, index) => (
                    <div
                      key={`${spec.label || "spec"}-${index}`}
                      className="grid grid-cols-[120px_1fr] gap-4 text-small-regular"
                    >
                      <dt className="text-ui-fg-muted">{spec.label}</dt>
                      <dd className="text-ui-fg-base">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            <div className="space-y-5">
              {enhancement.care_notes && (
                <div>
                  <h2 className="text-base-semi text-ui-fg-base">
                    Care notes
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-base-regular text-ui-fg-subtle">
                    {enhancement.care_notes}
                  </p>
                </div>
              )}
              {enhancement.video_url && (
                <a
                  href={enhancement.video_url}
                  className="inline-flex text-base-semi text-ui-fg-base underline underline-offset-4"
                  rel="noreferrer"
                  target="_blank"
                >
                  Watch product video
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductEnhancement
