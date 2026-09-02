import type {
  PayloadRichText,
  PayloadRichTextNode,
} from "@lib/data/payload-articles"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { ReactNode } from "react"

function textAlignClass(format?: number | string) {
  if (format === "center") {
    return "text-center"
  }

  if (format === "right" || format === "end") {
    return "text-right"
  }

  if (format === "justify") {
    return "text-justify"
  }

  return ""
}

function applyTextFormat(text: ReactNode, format?: number | string) {
  if (typeof format !== "number") {
    return text
  }

  let output = text

  if (format & 1) {
    output = <strong>{output}</strong>
  }

  if (format & 2) {
    output = <em>{output}</em>
  }

  if (format & 4) {
    output = <span className="underline">{output}</span>
  }

  if (format & 8) {
    output = <span className="line-through">{output}</span>
  }

  if (format & 16) {
    output = <code>{output}</code>
  }

  return output
}

function renderChildren(children?: PayloadRichTextNode[]) {
  return children?.map((child, index) => renderNode(child, index)) || null
}

function renderUpload(node: PayloadRichTextNode, key: number) {
  const value = typeof node.value === "object" ? node.value : null

  if (!value?.url) {
    return null
  }

  return (
    <figure key={key} className="my-10 small:my-12">
      <img
        src={value.url}
        alt={value.alt || ""}
        className="aspect-[4/3] w-full rounded-[20px] border border-[#E6E8EC] object-cover xsmall:aspect-[16/10]"
        loading="lazy"
      />
      {value.alt && (
        <figcaption className="mt-3 text-sm leading-6 text-muted">
          {value.alt}
        </figcaption>
      )}
    </figure>
  )
}

function renderNode(node: PayloadRichTextNode, key: number): ReactNode {
  if (node.text !== undefined) {
    return <span key={key}>{applyTextFormat(node.text, node.format)}</span>
  }

  const alignment = textAlignClass(node.format)

  switch (node.type) {
    case "heading": {
      const Tag = node.tag === "h2" || node.tag === "h3" ? node.tag : "h2"
      const className =
        Tag === "h3"
          ? "mb-4 mt-10 font-display text-[25px] font-bold leading-tight tracking-[-0.025em] text-ink small:text-[30px]"
          : "mb-5 mt-12 font-display text-[31px] font-bold leading-tight tracking-[-0.035em] text-ink small:text-[38px]"

      return (
        <Tag key={key} className={`${className} ${alignment}`.trim()}>
          {renderChildren(node.children)}
        </Tag>
      )
    }
    case "paragraph":
      return (
        <p key={key} className={`my-6 ${alignment}`.trim()}>
          {renderChildren(node.children)}
        </p>
      )
    case "quote":
      return (
        <blockquote
          key={key}
          className="my-10 rounded-r-[20px] border-l-4 border-brand bg-mint/45 px-6 py-6 font-display text-[23px] font-semibold leading-snug text-ink small:px-8 small:text-[28px]"
        >
          {renderChildren(node.children)}
        </blockquote>
      )
    case "list":
      return node.tag === "ol" ? (
        <ol
          key={key}
          className="my-7 list-decimal space-y-3 pl-6 marker:font-bold marker:text-brand"
        >
          {renderChildren(node.children)}
        </ol>
      ) : (
        <ul
          key={key}
          className="my-7 list-disc space-y-3 pl-6 marker:text-brand"
        >
          {renderChildren(node.children)}
        </ul>
      )
    case "listitem":
      return <li key={key}>{renderChildren(node.children)}</li>
    case "link": {
      const href = node.fields?.url || node.url

      if (!href) {
        return <span key={key}>{renderChildren(node.children)}</span>
      }

      if (href.startsWith("/")) {
        return (
          <LocalizedClientLink
            key={key}
            href={href}
            className="pbn-focus rounded-sm font-semibold text-brand underline decoration-2 underline-offset-4 hover:text-brand-dark"
          >
            {renderChildren(node.children)}
          </LocalizedClientLink>
        )
      }

      return (
        <a
          key={key}
          href={href}
          className="pbn-focus rounded-sm font-semibold text-brand underline decoration-2 underline-offset-4 hover:text-brand-dark"
          rel={node.fields?.newTab ? "noreferrer" : undefined}
          target={node.fields?.newTab ? "_blank" : undefined}
        >
          {renderChildren(node.children)}
        </a>
      )
    }
    case "upload":
      return renderUpload(node, key)
    case "horizontalrule":
      return <hr key={key} className="my-12 border-[#E6E8EC]" />
    default:
      return <div key={key}>{renderChildren(node.children)}</div>
  }
}

export default function RichText({ content }: { content?: PayloadRichText }) {
  if (!content?.root?.children?.length) {
    return null
  }

  return (
    <div className="break-words text-base leading-8 text-muted small:text-[18px] small:leading-9">
      {renderChildren(content.root.children)}
    </div>
  )
}
