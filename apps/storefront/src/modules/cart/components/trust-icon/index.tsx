// Keep these small icons self-contained: shared SVG clipPath IDs can resolve to
// another (hidden) icon on the page and make the trust icons disappear.
const TrustIcon = ({ kind }: { kind: "payment" | "shipping" | "returns" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    {kind === "returns" ? (
      <>
        <circle cx="7.5" cy="7.5" r="7" fill="currentColor" />
        <path d="m4.2 7.5 2.1 2.2 4.4-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {kind === "payment" ? (
          <>
            <rect x="1" y="2.8" width="13" height="9.4" rx="1.8" />
            <path d="M1 5.9h13M3.3 9.5H6m4.8 0h.9" />
          </>
        ) : (
          <>
            <circle cx="3.5" cy="11.5" r="1.4" />
            <circle cx="9.3" cy="11.5" r="1.4" />
            <path d="M4.9 11.3h3M4.1 2.5h3.6c.9 0 1.6.7 1.6 1.6v6M9.3 4.9h1.8l2.2 3v1.8c0 .9-.7 1.6-1.6 1.6h-1M9.3 7.7h4M2.5 4.9h3.4M.9 7.3h3.4" />
          </>
        )}
      </g>
    )}
  </svg>
)

export default TrustIcon
