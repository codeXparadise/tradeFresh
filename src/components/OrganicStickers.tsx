// Crisp organic leaf & botanical sticker accents (B2B fresh produce aesthetic)

export function OrganicLeafSprig({
  size = 56,
  flip = false,
}: {
  size?: number;
  flip?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      style={{
        transform: flip ? 'scaleX(-1)' : undefined,
        pointerEvents: 'none',
      }}
    >
      <path
        d="M12 52C14 31 28 16 52 12C50 36 34 49 12 52Z"
        fill="#5E9E31"
        fillOpacity="0.2"
        stroke="#5E9E31"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 52C24 40 36 28 52 12"
        stroke="#1F4E2B"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M27 37C24 31 24 26 26 22M35 29C40 31 44 30 47 28"
        stroke="#5E9E31"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OrganicTomatoSticker({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <circle
        cx="32"
        cy="36"
        r="19"
        fill="#D33F24"
        fillOpacity="0.16"
        stroke="#D33F24"
        strokeWidth="2"
      />
      <path
        d="M32 17C28 11 22 12 20 15C24 16 28 18 32 20C36 18 40 16 44 15C42 12 36 11 32 17Z"
        fill="#5E9E31"
        stroke="#1F4E2B"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M23 31C23 27 27 24 31 24"
        stroke="#D33F24"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OrganicChiliSticker({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <path
        d="M44 16C48 26 42 46 18 50C14 50 13 46 17 44C28 38 34 26 35 16H44Z"
        fill="#5E9E31"
        fillOpacity="0.2"
        stroke="#1F4E2B"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M39 16C40 11 43 9 47 9"
        stroke="#5E9E31"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
