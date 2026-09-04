export function BottleHero({ className }: { className?: string }) {
  const bottlePath =
    "M140,18 L180,18 L180,128 C180,148 202,158 212,180 C228,206 262,222 262,262 L262,656 C262,675 246,688 225,688 L95,688 C74,688 58,675 58,656 L58,262 C58,222 92,206 108,180 C118,158 140,148 140,128 Z";

  return (
    <svg viewBox="0 0 320 740" className={className} role="img" aria-label="Botella de vino Altos del Uco">
      <defs>
        <linearGradient id="bh-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#040302" />
          <stop offset="34%" stopColor="#2a1d12" />
          <stop offset="50%" stopColor="#4a3220" />
          <stop offset="68%" stopColor="#221709" />
          <stop offset="100%" stopColor="#040302" />
        </linearGradient>
        <linearGradient id="bh-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e3a866" stopOpacity="0" />
          <stop offset="14%" stopColor="#e3a866" stopOpacity="0.85" />
          <stop offset="26%" stopColor="#e3a866" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="bh-glow" cx="50%" cy="22%" r="42%">
          <stop offset="0%" stopColor="#c1793f" stopOpacity="0.28" />
          <stop offset="45%" stopColor="#c1793f" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#c1793f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bh-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <clipPath id="bh-clip">
          <path d={bottlePath} />
        </clipPath>
      </defs>

      <ellipse cx="160" cy="220" rx="240" ry="240" fill="url(#bh-glow)" />
      <ellipse cx="160" cy="706" rx="120" ry="22" fill="url(#bh-shadow)" />

      <path d={bottlePath} fill="url(#bh-glass)" />

      <g clipPath="url(#bh-clip)">
        <rect x="52" y="0" width="36" height="740" fill="url(#bh-rim)" />
        <ellipse cx="160" cy="140" rx="100" ry="50" fill="#e3a866" opacity="0.1" />
      </g>

      <path d={bottlePath} fill="none" stroke="#c1793f" strokeOpacity="0.35" strokeWidth="1.25" />

      <rect x="90" y="386" width="140" height="132" fill="none" stroke="#c1793f" strokeOpacity="0.7" strokeWidth="1" />
      <text
        x="160"
        y="432"
        textAnchor="middle"
        fill="#dba368"
        fontFamily="Georgia, 'Playfair Display', serif"
        fontSize="16"
        letterSpacing="4"
      >
        ALTOS
      </text>
      <line x1="114" y1="446" x2="206" y2="446" stroke="#c1793f" strokeOpacity="0.55" strokeWidth="0.75" />
      <text
        x="160"
        y="470"
        textAnchor="middle"
        fill="#dba368"
        fontFamily="Georgia, 'Playfair Display', serif"
        fontSize="12"
        letterSpacing="3"
      >
        DEL UCO
      </text>
      <text
        x="160"
        y="498"
        textAnchor="middle"
        fill="#e3d4bc"
        fontFamily="Georgia, serif"
        fontSize="8"
        letterSpacing="1.5"
        opacity="0.7"
      >
        VALLE DE UCO
      </text>

      <rect x="133" y="6" width="54" height="32" rx="2" fill="url(#bh-glass)" stroke="#c1793f" strokeOpacity="0.55" strokeWidth="1" />
    </svg>
  );
}
