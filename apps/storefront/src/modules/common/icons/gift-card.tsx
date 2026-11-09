import type { IconProps } from "types/icon"

const GiftCard = ({
  size = "20",
  color = "currentColor",
  ...attributes
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...attributes}
  >
    <rect
      x="2.25"
      y="5.25"
      width="15.5"
      height="11.5"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
    />
    <path d="M2.75 9h14.5M10 5.5v10.75" stroke={color} strokeWidth="1.5" />
    <path
      d="M10 5.25C8.35 5.25 6.9 4.55 6.9 3.55c0-.75.62-1.3 1.45-1.3C9.65 2.25 10 3.75 10 5.25Zm0 0c1.65 0 3.1-.7 3.1-1.7 0-.75-.62-1.3-1.45-1.3C10.35 2.25 10 3.75 10 5.25Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default GiftCard
