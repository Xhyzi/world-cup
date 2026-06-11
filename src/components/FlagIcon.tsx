interface FlagIconProps {
  readonly countryCode: string;
}

export function FlagIcon({ countryCode }: FlagIconProps) {
  if (!countryCode) return null;
  const code = countryCode.toLowerCase();
  return <span className={`fi fi-${code}`} />;
}
