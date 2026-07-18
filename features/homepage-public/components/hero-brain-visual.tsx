/** Glowing brain illustration for the hero — pure SVG, no external assets. */
export function HeroBrainVisual() {
  return (
    <div className="relative flex size-full items-center justify-center" aria-hidden>
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-[80px]" />
      <div className="absolute inset-8 rounded-full bg-accent/15 blur-[60px]" />
      <div className="absolute bottom-0 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full bg-primary/30 blur-[40px]" />

      <svg
        viewBox="0 0 320 320"
        className="relative size-full max-w-[22rem] drop-shadow-[0_0_40px_rgba(139,92,246,0.5)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brain-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <filter id="brain-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="160" cy="280" rx="90" ry="12" fill="rgba(139,92,246,0.25)" />

        <path
          d="M160 60 C120 60 90 90 85 130 C75 125 60 140 65 165 C55 175 60 200 80 210 C75 235 95 255 120 260 C130 275 150 280 160 280 C170 280 190 275 200 260 C225 255 245 235 240 210 C260 200 265 175 255 165 C260 140 245 125 235 130 C230 90 200 60 160 60Z"
          stroke="url(#brain-grad)"
          strokeWidth="2"
          fill="rgba(139,92,246,0.08)"
          filter="url(#brain-glow)"
        />

        <path
          d="M160 90 C135 90 115 110 112 135 M160 90 C185 90 205 110 208 135 M112 135 C105 150 108 170 120 180 M208 135 C215 150 212 170 200 180 M120 180 C125 200 140 215 160 220 M200 180 C195 200 180 215 160 220 M160 120 L160 220 M140 145 C150 150 170 150 180 145 M135 175 C150 182 170 182 185 175"
          stroke="url(#brain-grad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        {[
          [120, 110], [200, 110], [100, 155], [220, 155],
          [130, 200], [190, 200], [160, 100], [160, 240],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="3"
            fill={i % 2 === 0 ? "#8B5CF6" : "#22D3EE"}
            opacity="0.9"
          >
            <animate
              attributeName="opacity"
              values="0.4;1;0.4"
              dur={`${2 + i * 0.3}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  )
}
