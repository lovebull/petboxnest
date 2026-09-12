export default function CheckoutLoading() {
  return (
    <main
      className="overflow-hidden bg-cream pb-16 text-ink small:pb-24"
      aria-busy="true"
      aria-label="Loading checkout"
    >
      <div className="content-container pt-8 xsmall:pt-10 small:pt-14">
        <div className="h-[230px] rounded-[24px] bg-mint/70 motion-safe:animate-pulse small:rounded-[32px]" />
        <div className="mt-6 grid grid-cols-1 items-start gap-6 small:mt-8 small:grid-cols-[minmax(0,1fr)_minmax(340px,416px)] small:gap-8 medium:gap-10">
          <div className="order-2 grid gap-5 small:order-1">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 rounded-[24px] border border-[#E6E8EC] bg-white motion-safe:animate-pulse small:rounded-[28px]"
              />
            ))}
          </div>
          <div className="order-1 h-80 rounded-[24px] border border-[#E6E8EC] bg-white motion-safe:animate-pulse small:order-2 small:rounded-[28px]" />
        </div>
      </div>
    </main>
  )
}
