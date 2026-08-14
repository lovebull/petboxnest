"use client"

import { ChevronLeft, ChevronRight } from "@medusajs/icons"
import { Button, Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useState } from "react"

export type HeroSlide = {
  id: string | number
  image: string
  alt?: string | null
  title: string
  description?: string | null
}

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) {
      return
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 6000)

    return () => window.clearInterval(interval)
  }, [slides.length])

  const showPrevious = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length)
  }

  const showNext = () => {
    setActiveSlide((current) => (current + 1) % slides.length)
  }

  const active = slides[activeSlide]

  return (
    <section className="relative h-[78vh] min-h-[560px] w-full overflow-hidden border-b border-ui-border-base bg-ui-bg-base">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          aria-hidden={activeSlide !== index}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            activeSlide === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.alt || slide.title}
            className="h-full w-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
        </div>
      ))}

      <div className="content-container relative z-10 flex h-full items-end pb-16 small:items-center small:pb-0">
        <div className="max-w-[620px] text-white">
          <Heading
            level="h1"
            className="text-[44px] leading-[48px] font-normal text-white small:text-[72px] small:leading-[76px]"
          >
            {active.title}
          </Heading>
          {active.description && (
            <p className="mt-5 max-w-[460px] text-base-regular text-white/85 small:text-large-regular">
              {active.description}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <LocalizedClientLink href="/store">
              <Button className="bg-white !text-black hover:bg-white/90">
                Shop now
              </Button>
            </LocalizedClientLink>
            <LocalizedClientLink href="/categories">
              <Button
                variant="secondary"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                Explore gear
              </Button>
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
            <button
              type="button"
              onClick={showPrevious}
              className="grid h-10 w-10 place-items-center border border-white/35 bg-black/25 text-white backdrop-blur transition hover:bg-white hover:text-ui-fg-base"
              aria-label="Show previous slide"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="grid h-10 w-10 place-items-center border border-white/35 bg-black/25 text-white backdrop-blur transition hover:bg-white hover:text-ui-fg-base"
              aria-label="Show next slide"
            >
              <ChevronRight />
            </button>
          </div>

          <div className="absolute bottom-8 left-6 z-20 flex gap-2 small:left-1/2 small:-translate-x-1/2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-1.5 transition-all ${
                  activeSlide === index ? "w-10 bg-white" : "w-4 bg-white/45"
                }`}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
