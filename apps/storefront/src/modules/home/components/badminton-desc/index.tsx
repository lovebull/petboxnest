const BadmintonDesc = ({ countryCode }: { countryCode: string }) => {
  return (
    <section className="border-y border-[#ded8c8] bg-[#f7f3e7] py-10 small:py-16">
      <div className="content-container">
        <div className="grid overflow-hidden medium:grid-cols-2 medium:items-stretch">
          <div className="h-[320px] overflow-hidden small:h-[440px] medium:h-[500px]">
            <img
              src="https://cdn.petboxnest.com/s/files/0822/Badminton-005-766x1024.webp"
              alt="Club Recess sporting display with trophies and a pennant"
              className="h-full w-full object-contain object-center transition-transform duration-700 ease-out hover:scale-[1.015]"
              loading="lazy"
            />
          </div>

          <div className="flex items-center px-7 py-12 small:px-12 small:py-16 medium:px-16 large:px-20">
            <div className="max-w-[520px]">
              <p className="text-xs font-medium uppercase tracking-[0.36em] text-[#272522]">
                Petboxnest
              </p>
              <h2 className="mt-5 font-serif text-[34px] font-normal leading-[1.12] tracking-[-0.025em] text-[#1f1d1a] small:text-[46px]">
                How Our Shuttlecocks Are Made
              </h2>
              <p className="mt-6 max-w-[500px] text-base leading-7 text-[#393631]">
                1. Material Selection Premium feathers, cork, and other
                materials are carefully selected and inspected to meet our
                quality standards.
              </p>
              <p>
                2. Feather Sorting & Preparation Feathers are sorted by size,
                weight, and quality, then cleaned and prepared for consistent
                performance.
              </p>
              <p>
                3. Shuttlecock Assembly Selected feathers are precisely
                positioned and securely fixed to the cork base to achieve stable
                and accurate flight.
              </p>
              <p>
                4. Quality Control & Packaging Each shuttlecock is inspected
                for balance, appearance, durability, and flight consistency
                before being carefully packaged for delivery.
              </p>

              <a
                href={`/${countryCode}/account`}
                className="mt-8 inline-flex min-h-11 items-center justify-center bg-[#242321] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-[#47443f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#242321]"
              >
                Join the club
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BadmintonDesc
