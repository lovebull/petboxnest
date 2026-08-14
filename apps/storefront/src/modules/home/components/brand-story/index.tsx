const BrandStory = () => {
  return (
    <section className="border-b border-[#ded8c8] bg-[#f7f3e7] py-10 small:py-16">
      <div className="content-container">
        <div className="grid overflow-hidden medium:grid-cols-2 medium:items-stretch">
          <div className="flex items-center px-2 py-10 small:px-8 small:py-14 medium:px-0 medium:py-16 medium:pr-16 large:pr-24">
            <div className="max-w-[500px]">
              <h2 className="font-serif text-[30px] font-normal leading-[1.18] tracking-[-0.02em] text-[#1f1d1a] small:text-[38px]">
                We made Larumsport for you.
              </h2>

              <div className="mt-6 space-y-5 text-[15px] leading-7 text-[#302e2a]">
                <p>You know the value of an hour that&apos;s entirely yours.</p>
                <p>
                  Maybe you&apos;re new to a sport and still finding your people.
                  Maybe you&apos;re a young parent who found a sport that finally
                  fits your life. Maybe you&apos;re the one who books the courts
                  and makes Saturday happen.
                </p>
                <p>
                  Whoever you are — you care about the details. You buy the
                  good coffee. You notice when something&apos;s well-made.
                </p>
                <p>
                  You want to show up looking like you. That&apos;s why we made
                  Larumsport.
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-[340px] overflow-hidden small:min-h-[480px] medium:min-h-[520px]">
            <img
              src="https://clubrecess.com/cdn/shop/files/CR_Club-Recess-Hat_Ecom_03_4x3_7004d8cb-8ddf-4cb3-8beb-4f98f84b536f.jpg?v=1779889760&width=690"
              alt="Woman wearing a navy sports cap"
              className="h-full w-full object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.015]"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default BrandStory
