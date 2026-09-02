"use client"

import { HttpTypes } from "@medusajs/types"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"
import Image from "next/image"
import { useRef, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  productTitle: string
}

const ImageGallery = ({ images, productTitle }: ImageGalleryProps) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const goToSlide = (index: number) => {
    if (!images.length) {
      return
    }

    const nextIndex = (index + images.length) % images.length
    const track = trackRef.current

    setActiveIndex(nextIndex)
    track?.scrollTo({
      left: nextIndex * track.clientWidth,
      behavior: "smooth",
    })
  }

  const handleScroll = () => {
    const track = trackRef.current

    if (!track?.clientWidth) {
      return
    }

    const nextIndex = Math.round(track.scrollLeft / track.clientWidth)

    if (nextIndex !== activeIndex && nextIndex < images.length) {
      setActiveIndex(nextIndex)
    }
  }

  if (!images.length) {
    return (
      <div className="grid aspect-square place-items-center rounded-[24px] border border-grey-20 bg-white px-6 text-center text-sm font-semibold text-muted">
        Product image coming soon
      </div>
    )
  }

  return (
    <div
      className="relative min-w-0"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${productTitle} product images`}
    >
      <div className="relative overflow-hidden rounded-[24px] border border-grey-20 bg-white">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square w-full shrink-0 snap-center snap-always"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${images.length}`}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  className="object-contain p-5 xsmall:p-8 small:p-10"
                  alt={`${productTitle} — view ${index + 1}`}
                  fill
                  sizes="(max-width: 1023px) 100vw, 58vw"
                />
              )}
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goToSlide(activeIndex - 1)}
              className="pbn-focus absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-circle border border-grey-20 bg-white/95 text-ink shadow-elevation-card-rest transition duration-200 hover:-translate-y-[calc(50%+2px)] hover:bg-white xsmall:left-4"
              aria-label="Previous product image"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goToSlide(activeIndex + 1)}
              className="pbn-focus absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-circle border border-grey-20 bg-white/95 text-ink shadow-elevation-card-rest transition duration-200 hover:-translate-y-[calc(50%+2px)] hover:bg-white xsmall:right-4"
              aria-label="Next product image"
            >
              <ChevronRight aria-hidden="true" />
            </button>

            <span
              className="absolute bottom-4 right-4 rounded-circle bg-ink px-3 py-1.5 text-xs font-bold text-white shadow-elevation-card-rest"
              aria-live="polite"
            >
              {activeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1 xsmall:mt-4"
          aria-label="Choose a product image"
        >
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => goToSlide(index)}
              className={`pbn-focus relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] border-2 bg-white transition duration-200 xsmall:h-20 xsmall:w-20 ${
                activeIndex === index
                  ? "border-brand shadow-elevation-card-rest"
                  : "border-grey-20 hover:border-brand/50"
              }`}
              aria-label={`Show product image ${index + 1}`}
              aria-pressed={activeIndex === index}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="80px"
                  className="object-contain p-1.5"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
