import { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  productTitle: string
}

const ImageGallery = ({ images, productTitle }: ImageGalleryProps) => {
  return (
    <div className="relative min-w-0">
      <div className="grid grid-cols-1 gap-3 xsmall:grid-cols-2 xsmall:gap-4">
        {images.map((image, index) => {
          return (
            <Container
              key={image.id}
              className={`relative aspect-square w-full overflow-hidden !rounded-[24px] !border !border-grey-20 !bg-mist !p-0 !shadow-none ${
                index === 0 ? "xsmall:col-span-2" : ""
              }`}
              id={image.id}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  className="absolute inset-0 object-contain p-4 transition-transform duration-300 hover:scale-[1.015] motion-reduce:transition-none xsmall:p-7"
                  alt={`${productTitle} — view ${index + 1}`}
                  fill
                  sizes={
                    index === 0
                      ? "(max-width: 1023px) 100vw, 58vw"
                      : "(max-width: 511px) 100vw, (max-width: 1023px) 50vw, 29vw"
                  }
                />
              )}
              {index === 0 && images.length > 1 && (
                <span className="absolute bottom-4 right-4 rounded-circle bg-white/95 px-3 py-1.5 text-xs font-bold text-ink shadow-elevation-card-rest">
                  1 / {images.length}
                </span>
              )}
            </Container>
          )
        })}
      </div>
    </div>
  )
}

export default ImageGallery
