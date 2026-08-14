import { ProductEnhancement as ProductEnhancementType } from "@lib/data/payload-product-enhancements"

type ProductEnhancementProps = {
  enhancement: ProductEnhancementType | null
}

const ProductEnhancement = ({ enhancement }: ProductEnhancementProps) => {
  if (!enhancement) {
    return null
  }

  const hasHighlights = Boolean(enhancement.highlights?.length)
  const hasSections = Boolean(enhancement.story_sections?.length)
  const hasSpecs = Boolean(enhancement.specifications?.length)

  if (!hasHighlights && !hasSections && !hasSpecs && !enhancement.care_notes) {
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

        {hasHighlights && (
          <div className="mt-10 grid gap-6 small:grid-cols-3">
            {enhancement.highlights?.map((highlight) => (
              <div
                key={highlight.label}
                className="border-t border-ui-border-base pt-5"
              >
                <h2 className="text-base-semi text-ui-fg-base">
                  {highlight.label}
                </h2>
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
            {enhancement.story_sections?.map((section) => (
              <article
                key={section.heading}
                className="grid gap-6 small:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] small:items-center"
              >
                {section.image?.url && (
                  <img
                    src={section.image.url}
                    alt={section.image.alt || section.heading}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div>
                  <h2 className="text-2xl-semi text-ui-fg-base">
                    {section.heading}
                  </h2>
                  <p className="mt-4 whitespace-pre-line text-base-regular text-ui-fg-subtle">
                    {section.body}
                  </p>
                </div>
              </article>
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
                  {enhancement.specifications?.map((spec) => (
                    <div
                      key={spec.label}
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
