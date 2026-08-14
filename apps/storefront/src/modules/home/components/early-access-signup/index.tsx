const EarlyAccessSignup = () => {
  return (
    <section id="early-access" className="content-container py-16 small:py-24">
      <div className="mx-auto max-w-[620px] text-center">
        <h2 className="font-serif text-[32px] font-normal leading-tight tracking-[-0.02em] text-ui-fg-base small:text-[42px]">
          The early bird gets the matching set.
        </h2>
        <p className="mt-4 text-sm leading-6 text-ui-fg-subtle">
          Join for first access to new drops and member exclusives.
        </p>

        <form action="#early-access" className="relative mx-auto mt-8 max-w-[500px]">
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
            className="h-12 w-full border border-ui-fg-base bg-transparent px-4 pr-14 text-sm text-ui-fg-base outline-none transition-colors placeholder:text-ui-fg-muted focus:border-ui-fg-interactive"
          />
          <button
            type="submit"
            aria-label="Join the early access list"
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-xl text-ui-fg-base transition-transform duration-200 hover:translate-x-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ui-fg-base"
          >
            <span aria-hidden="true">→</span>
          </button>
        </form>
      </div>
    </section>
  )
}

export default EarlyAccessSignup
