const ContactHero = () => {
  return (
    <section className="relative isolate flex min-h-[380px] w-full items-center justify-center overflow-hidden small:min-h-[460px]">
      <img
        src="https://cdn.larumsport.com/s/files/0822/banner-brand-img-blog.webp"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 -z-10 bg-[#063f43]/70" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/15 via-transparent to-black/20" />

      <div className="content-container py-16 text-center text-white">
        <h2 className="mx-auto max-w-[940px] font-serif text-[30px] font-semibold leading-[1.22] tracking-[-0.015em] text-white small:text-[42px]">
          We create quality badminton gear and accessories designed for players of all levels, bringing performance, passion, and the spirit of badminton to every game.
        </h2>
        <a
          href="mailto:contact@larumsport.com"
          className="mt-8 inline-flex min-h-12 min-w-[156px] items-center justify-center bg-white px-8 text-sm font-medium tracking-[0.08em] text-[#272522] transition-colors duration-200 hover:bg-[#f0ede5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Contact us
        </a>
      </div>
    </section>
  )
}

export default ContactHero
