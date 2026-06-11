interface AppLogoProps {
  className?: string;
}

export function AppLogo({ className = "w-8 h-8" }: AppLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="logoFlame1" cx="50%" cy="80%" r="50%">
          <stop offset="0%" stopColor="#FFEB3B" />
          <stop offset="50%" stopColor="#FF9800" />
          <stop offset="100%" stopColor="#F44336" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="logoFlame2" cx="50%" cy="80%" r="50%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="60%" stopColor="#FF5722" />
          <stop offset="100%" stopColor="#D32F2F" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="52" rx="22" ry="14" fill="url(#logoFlame1)" opacity="0.9" />
      <path
        d="M18 48 C16 38 22 28 26 36 C24 26 32 18 32 28 C32 16 40 24 38 34 C42 26 48 36 46 48 Z"
        fill="url(#logoFlame2)"
        opacity="0.85"
      />
      <path
        d="M24 50 C22 42 28 34 30 40 C28 32 34 26 34 34 C34 28 38 32 37 40 C40 34 44 42 42 50 Z"
        fill="#FF9800"
        opacity="0.7"
      />
      <circle cx="32" cy="30" r="18" fill="#F5F5F5" stroke="#333" strokeWidth="1.5" />
      <path d="M32 14 L38 22 L36 32 L28 32 L26 22 Z" fill="#333" />
      <path
        d="M32 14 L26 22 L20 26 L24 34 L28 32 L26 22 Z"
        fill="none"
        stroke="#333"
        strokeWidth="1.2"
      />
      <path
        d="M32 14 L38 22 L44 26 L40 34 L36 32 L38 22 Z"
        fill="none"
        stroke="#333"
        strokeWidth="1.2"
      />
      <path
        d="M20 26 L24 34 L28 46 L32 46 L28 32 L26 22 Z"
        fill="none"
        stroke="#333"
        strokeWidth="1.2"
      />
      <path
        d="M44 26 L40 34 L36 46 L32 46 L36 32 L38 22 Z"
        fill="none"
        stroke="#333"
        strokeWidth="1.2"
      />
      <path
        d="M24 34 L28 46 L36 46 L40 34 L36 32 L28 32 Z"
        fill="none"
        stroke="#333"
        strokeWidth="1.2"
      />
      <path
        d="M20 26 L26 22 L32 14 L38 22 L44 26 L40 34 L36 46 L28 46 L24 34 Z"
        fill="none"
        stroke="#333"
        strokeWidth="1.2"
      />
    </svg>
  );
}
