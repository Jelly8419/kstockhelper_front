/**
 * Line icons for the "What We Help With" steps on the Real Estate home
 * (k-property mockup). Inline SVG (no asset files); stroke uses the brand color
 * via currentColor. `index` is the 0-based step position (0..4).
 */
export function ScopeStepIcon({
  index,
  size = 24,
}: {
  index: number;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (index) {
    case 0: // Property Search — magnifier
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case 1: // Remote Viewings & Screening — monitor
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      );
    case 2: // Brokerage & Negotiation — handshake
      return (
        <svg {...common}>
          <path d="M11 17 8.5 14.5a2 2 0 0 1 0-2.8l3-3a2 2 0 0 1 2.8 0l3.7 3.7" />
          <path d="m14 15 2 2M17 12l2 2 2-2-4-4-2 1" />
          <path d="M7 11 3 15l2 2 2-2" />
        </svg>
      );
    case 3: // Legal, Tax & Paperwork — document with check
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M9 14l2 2 3-3.5" />
        </svg>
      );
    case 4: // Payment & Closing — house
      return (
        <svg {...common}>
          <path d="M3 10.5 12 4l9 6.5" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    default:
      return null;
  }
}
