import type { FC } from "react"

interface SareeLogoProps {
  className?: string
}

const SareeLogo: FC<SareeLogoProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
        fill="url(#saree-gradient)"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M12 5C8.5 5 6 8 6 12C6 16 8.5 19 12 19C15.5 19 18 16 18 12"
        stroke="#FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M18 12C18 8 15.5 5 12 5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 2" />
      <defs>
        <linearGradient id="saree-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C1A34" />
          <stop offset="100%" stopColor="#D19E1F" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default SareeLogo

