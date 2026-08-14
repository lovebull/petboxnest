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
    <figure key={key} className="my-10">
      <img
        src={value.url}
        alt={value.alt || ""}
        className="aspect-[16/10] w-full object-cover"
        loading="lazy"
      />
      {value.alt && (
        <figcaption className="mt-3 text-xs leading-5 text-ui-fg-muted">
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
          ? "mt-9 font-serif text-[28px] leading-tight tracking-[-0.02em] text-ui-fg-base"
          : "mt-12 font-serif text-[36px] leading-tight tracking-[-0.02em] text-ui-fg-base"

      return (
        <Tag key={key} className={`${className} ${alignment}`.trim()}>
          {renderChildren(node.children)}
        </Tag>
      )
    }
    case "paragraph":
      return (
        <p key={key} className={`my-5 ${alignment}`.trim()}>
          {renderChildren(node.children)}
        </p>
      )
    case "quote":
      return (
        <blockquote
          key={key}
          className="my-8 border-l border-ui-fg-base pl-6 font-serif text-[26px] leading-snug text-ui-fg-base"
        >
          {renderChildren(node.children)}
        </blockquote>
      )
    case "list":
      return node.tag === "ol" ? (
        <ol key={key} className="my-6 list-decimal space-y-2 pl-6">
          {renderChildren(node.children)}
        </ol>
      ) : (
        <ul key={key} className="my-6 list-disc space-y-2 pl-6">
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
          <LocalizedClientLink key={key} href={href} className="underline">
            {renderChildren(node.children)}
          </LocalizedClientLink>
        )
      }

      return (
        <a
          key={key}
          href={href}
          className="underline"
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
      return <hr key={key} className="my-10 border-[#ded8c8]" />
    default:
      return <div key={key}>{renderChildren(node.children)}</div>
  }
}

export default function RichText({ content }: { content?: PayloadRichText }) {
  if (!content?.root?.children?.length) {
    return null
  }

  return (
    <div className="text-[15px] leading-7 text-ui-fg-subtle small:text-base small:leading-8">
      {renderChildren(content.root.children)}
    </div>
  )
}
