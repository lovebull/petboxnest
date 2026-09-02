const EarlyAccessSignup = () => {
  return (
    <section id="early-access" className="bg-mint py-16 small:py-20">
      <div className="pbn-container">
        <div className="mx-auto max-w-[680px] text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Stay in the loop
          </p>
          <h2 className="mt-3 font-display text-[34px] font-bold leading-tight tracking-[-0.035em] text-ink small:text-[46px]">
            Fresh finds for their favorite corner.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">
            Get first looks at useful new arrivals and thoughtful ideas for
            living better with pets.
          </p>

          <form
            action="#early-access"
            className="relative mx-auto mt-8 max-w-[500px]"
          >
            <label htmlFor="early-access-email" className="sr-only">
              Email address
            </label>
            <input
              id="early-access-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              className="h-12 w-full rounded-[14px] border-2 border-ink bg-white px-4 pr-14 text-base text-ink outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <button
              type="submit"
              aria-label="Join the early access list"
              className="pbn-focus absolute inset-y-1 right-1 flex w-11 items-center justify-center rounded-[11px] bg-brand text-xl text-white transition-colors hover:bg-brand-dark"
            >
              <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default EarlyAccessSignup
