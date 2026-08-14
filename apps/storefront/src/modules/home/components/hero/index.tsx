import { getHeroOnlineImages } from "@lib/data/payload-online-images"
import HeroSlider, { type HeroSlide } from "./hero-slider"

const Hero = async () => {
  const onlineImages = await getHeroOnlineImages({ limit: 5 })
  const slides = onlineImages
    .filter((image) => image.image_url)
    .map<HeroSlide>((image) => ({
      id: image.id,
      image: image.image_url,
      alt: image.alt,
      title: image.title,
      description: image.description,
    }))

  if (!slides.length) {
    return null
  }

  return <HeroSlider slides={slides} />
}

export default Hero
