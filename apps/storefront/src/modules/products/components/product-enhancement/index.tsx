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
          className={`mt-8 font-display text-2xl font-bold leading-tight text-ink first:mt-0 xsmall:text-3xl ${textAlignClass}`}
        >
          {children}
        </Tag>
      )
    }
    case "paragraph":
      return (
        <p
          key={key}
          className={`mt-4 text-base leading-7 text-muted first:mt-0 ${textAlignClass}`}
        >
          {children}
        </p>
      )
    case "quote":
      return (
        <blockquote
          key={key}
          className={`mt-6 rounded-r-[16px] border-l-4 border-yellow bg-cream py-4 pl-5 pr-4 text-base font-semibold leading-7 text-ink ${textAlignClass}`}
        >
          {children}
        </blockquote>
      )
    case "list": {
      const ListTag = node.listType === "number" ? "ol" : "ul"
      const listClass =
        node.listType === "number" ? "list-decimal pl-6" : "list-disc pl-6"

      return (
        <ListTag
          key={key}
          className={`mt-4 space-y-2 text-base leading-7 text-muted marker:text-brand ${listClass} ${textAlignClass}`}
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
          className="pbn-focus rounded-soft font-semibold text-brand-dark underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
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
        <figure
          key={key}
          className={`mt-8 flex overflow-hidden rounded-[24px] ${getMediaAlignClass(
            node.format
          )}`}
        >
          <img
            src={media.url}
            alt={node.fields?.alt || media.alt || ""}
            width={media.width}
            height={media.height}
            className="h-auto max-w-full rounded-[24px]"
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
    <div className="mt-8 max-w-3xl">
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
    <section className="bg-white py-16 small:py-24">
      <div className="pbn-container">
        {(enhancement.hero_eyebrow || enhancement.subtitle) && (
          <div className="max-w-3xl rounded-[24px] bg-cream p-6 xsmall:p-8 small:p-10">
            {enhancement.hero_eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                {enhancement.hero_eyebrow}
              </p>
            )}
            {enhancement.subtitle && (
              <p className="mt-3 font-display text-2xl font-bold leading-tight text-ink xsmall:text-3xl">
                {enhancement.subtitle}
              </p>
            )}
          </div>
        )}

        <ProductRichText content={enhancement.content} />

        {hasHighlights && (
          <div className="mt-10 grid gap-4 xsmall:grid-cols-3 small:mt-14 small:gap-6">
            {highlights.map((highlight, index) => (
              <div
                key={`${highlight.label || "highlight"}-${index}`}
                className={`rounded-[22px] p-5 xsmall:p-6 ${
                  index % 3 === 0
                    ? "bg-mint/60"
                    : index % 3 === 1
                    ? "bg-sky/60"
                    : "bg-yellow/60"
                }`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-circle bg-white text-sm font-bold text-brand">
                  {index + 1}
                </span>
                {highlight.label && (
                  <h2 className="mt-5 font-display text-lg font-bold leading-tight text-ink">
                    {highlight.label}
                  </h2>
                )}
                {highlight.description && (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {highlight.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {hasSections && (
          <div className="mt-14 grid gap-6 small:mt-20 small:gap-10">
            {storySections.map((section, index) => {
              const imageOnRight = section.image_position === "right"

              return (
                <article
                  key={`${section.heading || "section"}-${index}`}
                  className="grid overflow-hidden rounded-[28px] border border-grey-20 bg-mist small:grid-cols-2 small:items-center"
                >
                  {section.image?.url && (
                    <img
                      src={section.image.url}
                      alt={section.image.alt || section.heading || ""}
                      width={section.image.width}
                      height={section.image.height}
                      className={`h-full min-h-[280px] w-full object-cover ${
                        imageOnRight ? "small:order-2" : ""
                      }`}
                      loading="lazy"
                    />
                  )}
                  <div
                    className={`p-6 xsmall:p-8 small:p-12 ${
                      imageOnRight ? "small:order-1" : ""
                    }`}
                  >
                    {section.heading && (
                      <h2 className="font-display text-3xl font-bold leading-tight text-ink">
                        {section.heading}
                      </h2>
                    )}
                    {section.body && (
                      <p className="mt-4 whitespace-pre-line text-base leading-7 text-muted">
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
          <div className="mt-14 grid gap-6 xsmall:grid-cols-3 small:mt-20">
            {imageBlocks.map((block, index) => (
              <figure
                key={`${block.title || "image"}-${index}`}
                className="overflow-hidden rounded-[22px] border border-grey-20 bg-white"
              >
                {block.image?.url && (
                  <img
                    src={block.image.url}
                    alt={block.image.alt || block.title || ""}
                    width={block.image.width}
                    height={block.image.height}
                    className="aspect-square h-auto w-full object-cover"
                    loading="lazy"
                  />
                )}
                {(block.title || block.description) && (
                  <figcaption className="p-5">
                    {block.title && (
                      <h2 className="font-display text-lg font-bold text-ink">
                        {block.title}
                      </h2>
                    )}
                    {block.description && (
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">
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
          <div className="mt-14 grid gap-8 rounded-[28px] bg-brand p-6 text-white xsmall:p-8 small:mt-20 small:grid-cols-2 small:p-12">
            {hasSpecs && (
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Product details
                </h2>
                <dl className="mt-5 grid gap-3">
                  {specifications.map((spec, index) => (
                    <div
                      key={`${spec.label || "spec"}-${index}`}
                      className="grid grid-cols-[minmax(90px,120px)_1fr] gap-4 border-b border-white/20 pb-3 text-sm"
                    >
                      <dt className="text-white/75">{spec.label}</dt>
                      <dd className="font-semibold text-white">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            <div className="space-y-5">
              {enhancement.care_notes && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Care notes
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-base leading-7 text-white/80">
                    {enhancement.care_notes}
                  </p>
                </div>
              )}
              {enhancement.video_url && (
                <a
                  href={enhancement.video_url}
                  className="pbn-focus inline-flex rounded-base text-base font-bold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
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
