interface FlagIconProps {
  readonly countryCode: string;
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
}

const SIZE_CLASSES = {
  sm: "w-4 h-3",
  md: "w-5 h-4",
  lg: "w-6 h-[18px]",
} as const;

export function FlagIcon({
  countryCode,
  size = "md",
  className = "",
}: FlagIconProps) {
  if (!countryCode) return null;
  const code = countryCode.toLowerCase();
  return (
    <span
      className={`fi fi-${code} inline-block shrink-0 rounded-sm ${SIZE_CLASSES[size]} ${className}`}
    />
  );
}
