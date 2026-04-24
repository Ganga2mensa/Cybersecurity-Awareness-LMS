interface KomorebiLogoProps {
  className?: string
  textColor?: string
  iconSize?: number
}

// SVG logo: stylized leaves growing from a shield/book base — inspired by the KomorebiSec brand
export function KomorebiLogo({ className = "", textColor = "text-white", iconSize = 32 }: KomorebiLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* SVG icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Base / book */}
        <rect x="8" y="26" width="24" height="5" rx="2" fill="#b45309" />
        {/* Center stem */}
        <rect x="19" y="12" width="2" height="14" rx="1" fill="#f97316" />
        {/* Left stem */}
        <rect x="13" y="16" width="2" height="10" rx="1" fill="#ea580c" />
        {/* Right stem */}
        <rect x="25" y="16" width="2" height="10" rx="1" fill="#ea580c" />
        {/* Center leaf top */}
        <ellipse cx="20" cy="9" rx="3.5" ry="5" fill="#f97316" />
        {/* Left leaf */}
        <ellipse cx="11" cy="13" rx="3" ry="4.5" transform="rotate(-20 11 13)" fill="#fb923c" />
        {/* Right leaf */}
        <ellipse cx="29" cy="13" rx="3" ry="4.5" transform="rotate(20 29 13)" fill="#fb923c" />
        {/* Far left leaf */}
        <ellipse cx="6" cy="17" rx="2.5" ry="3.5" transform="rotate(-35 6 17)" fill="#fdba74" />
        {/* Far right leaf */}
        <ellipse cx="34" cy="17" rx="2.5" ry="3.5" transform="rotate(35 34 17)" fill="#fdba74" />
        {/* K letter on base */}
        <text x="15.5" y="30.5" fontSize="6" fontWeight="bold" fill="white" fontFamily="sans-serif">K</text>
      </svg>

      {/* Text */}
      <span className={`font-bold tracking-tight ${textColor}`} style={{ fontSize: iconSize * 0.6 }}>
        Komorebi<span className="text-orange-500">Sec</span>
      </span>
    </div>
  )
}
