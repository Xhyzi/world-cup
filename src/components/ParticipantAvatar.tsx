import type { ReactElement } from "react";

type AvatarSize = "sm" | "md" | "lg";

interface ParticipantAvatarProps {
  participantId: string;
  color: string;
  size?: AvatarSize;
  rounded?: "full" | "xl";
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

const ROUNDED_CLASSES = {
  full: "rounded-full",
  xl: "rounded-2xl",
};

function SamueliAvatar() {
  return (
    <>
      <ellipse cx="24" cy="14" rx="16" ry="10" fill="#5c3d2e" />
      <ellipse cx="24" cy="16" rx="14" ry="7" fill="#6b4423" />
      <ellipse cx="24" cy="30" rx="18" ry="20" fill="#ffdbac" />
      <ellipse cx="24" cy="32" rx="14" ry="12" fill="#f5c89a" />
      <ellipse cx="17" cy="37" rx="5" ry="3" fill="#8b7a9e" opacity="0.55" />
      <ellipse cx="31" cy="37" rx="5" ry="3" fill="#8b7a9e" opacity="0.55" />
      <circle cx="20" cy="34" r="2" fill="#1a1a2e" />
      <circle cx="28" cy="34" r="2" fill="#1a1a2e" />
      <path d="M18 30 Q20 28 22 30" stroke="#4a3728" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M26 30 Q28 28 30 30" stroke="#4a3728" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M21 44 Q24 46 27 44" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}

function RobertoOOAvatar() {
  return (
    <>
      <ellipse cx="24" cy="14" rx="16" ry="10" fill="#3d2b1f" />
      <ellipse cx="24" cy="16" rx="14" ry="7" fill="#4a3728" />
      <ellipse cx="24" cy="30" rx="18" ry="20" fill="#ffdbac" />
      <ellipse cx="24" cy="32" rx="14" ry="12" fill="#f5c89a" />
      <rect x="13" y="30" width="22" height="10" rx="4" fill="none" stroke="#1a1a2e" strokeWidth="1.8" />
      <line x1="24" y1="30" x2="24" y2="40" stroke="#1a1a2e" strokeWidth="1.2" />
      <circle cx="19" cy="35" r="2.2" fill="#1a1a2e" />
      <circle cx="29" cy="35" r="2.2" fill="#1a1a2e" />
      <circle cx="19" cy="35" r="0.8" fill="white" opacity="0.6" />
      <circle cx="29" cy="35" r="0.8" fill="white" opacity="0.6" />
      <path d="M20 44 Q24 47 28 44" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}

function SamuelAvatar() {
  return (
    <>
      <ellipse cx="24" cy="13" rx="16" ry="10" fill="#e8c547" />
      <ellipse cx="24" cy="15" rx="14" ry="7" fill="#f0d060" />
      <ellipse cx="24" cy="30" rx="18" ry="20" fill="#ffdbac" />
      <ellipse cx="24" cy="32" rx="14" ry="12" fill="#f5c89a" />
      <path d="M14 40 Q16 50 24 52 Q32 50 34 40" fill="#c9a84c" />
      <path d="M16 42 Q20 48 24 49 Q28 48 32 42" fill="#d4b85a" />
      <path d="M17 38 Q24 44 31 38" fill="#b8943f" opacity="0.7" />
      <path d="M15 29 L21 33" stroke="#4a3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M33 29 L27 33" stroke="#4a3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M22 30 L26 30" stroke="#4a3728" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="16" cy="39" rx="3" ry="2" fill="#e57373" opacity="0.45" />
      <ellipse cx="32" cy="39" rx="3" ry="2" fill="#e57373" opacity="0.45" />
      <ellipse cx="20" cy="36" rx="2.5" ry="2" fill="#1a1a2e" />
      <ellipse cx="28" cy="36" rx="2.5" ry="2" fill="#1a1a2e" />
      <rect x="18" y="43" width="12" height="4" rx="1" fill="#1a1a2e" />
      <rect x="19" y="44" width="2" height="2" fill="white" />
      <rect x="22" y="44" width="2" height="2" fill="white" />
      <rect x="25" y="44" width="2" height="2" fill="white" />
      <rect x="28" y="44" width="2" height="2" fill="white" />
    </>
  );
}

function EvaAvatar() {
  return (
    <>
      <path d="M10 18 Q8 30 11 42 Q13 48 16 46" fill="#1a1a1a" />
      <path d="M38 18 Q40 30 37 42 Q35 48 32 46" fill="#1a1a1a" />
      <ellipse cx="24" cy="13" rx="15" ry="9" fill="#1a1a1a" />
      <ellipse cx="24" cy="30" rx="17" ry="19" fill="#fff5ee" />
      <ellipse cx="24" cy="32" rx="13" ry="11" fill="#ffe8d6" />
      <path d="M14 16 Q18 12 24 12 Q30 12 34 16 Q32 20 24 21 Q16 20 14 16" fill="#1a1a1a" />
      <path d="M18 30 Q20 29 22 30" stroke="#2d2d2d" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M26 30 Q28 29 30 30" stroke="#2d2d2d" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="20" cy="35" rx="2.8" ry="3.2" fill="white" stroke="#2d2d2d" strokeWidth="0.8" />
      <ellipse cx="28" cy="35" rx="2.8" ry="3.2" fill="white" stroke="#2d2d2d" strokeWidth="0.8" />
      <circle cx="20" cy="35" r="1.4" fill="#3d2314" />
      <circle cx="28" cy="35" r="1.4" fill="#3d2314" />
      <circle cx="20.5" cy="34.2" r="0.5" fill="white" opacity="0.7" />
      <circle cx="28.5" cy="34.2" r="0.5" fill="white" opacity="0.7" />
      <path d="M18 37 L18 40" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />
      <path d="M19 37 L19 40" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />
      <path d="M29 37 L29 40" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />
      <path d="M30 37 L30 40" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="24" cy="40" rx="1.2" ry="1.5" fill="#f0c8b8" opacity="0.6" />
      <path d="M21 44 Q24 46 27 44" stroke="#d81b60" strokeWidth="2" fill="#f48fb1" strokeLinecap="round" />
    </>
  );
}

const AVATARS: Record<string, () => ReactElement> = {
  p1: SamueliAvatar,
  p2: RobertoOOAvatar,
  p3: SamuelAvatar,
  p4: EvaAvatar,
};

export function ParticipantAvatar({
  participantId,
  color,
  size = "md",
  rounded = "full",
}: ParticipantAvatarProps) {
  const Avatar = AVATARS[participantId] ?? SamueliAvatar;

  return (
    <div
      className={`${SIZE_CLASSES[size]} ${ROUNDED_CLASSES[rounded]} flex-shrink-0 overflow-hidden border-2 border-white/30 shadow-sm`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 56" className="w-full h-full">
        <Avatar />
      </svg>
    </div>
  );
}
