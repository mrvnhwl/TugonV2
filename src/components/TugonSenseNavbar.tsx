import type { SVGProps } from "react";
import { predefinedAnswers } from "./data/answers";
import logo from "./assets/images/brain.png"; // Tugon logo currently in the project

// Simple inline icons (no extra dependency)
// Center nav icons removed (nav hidden under overlay)

const MenuIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

const CoinIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <defs>
      <linearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" fill="url(#coinGrad)" stroke="#EAB308" strokeWidth="1.5" />
    <polygon points="12,7.5 13.76,10.76 17.4,11.3 14.7,13.84 15.34,17.45 12,15.85 8.66,17.45 9.3,13.84 6.6,11.3 10.24,10.76" fill="#FCD34D" stroke="#D97706" strokeWidth="0.6" strokeLinejoin="round" />
  </svg>
);

type NavbarProps = { coins?: number; onCoinClick?: () => void; centerActiveIndex?: number };

export default function TugonSenseNavbar({ coins = 2, onCoinClick, centerActiveIndex = 0 }: NavbarProps) {
  const stepsCount = predefinedAnswers.length;
  if ((import.meta as any)?.env?.DEV) console.log("steps", stepsCount);
  return (
    <div className="w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Centered progress bar overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-3xl px-16">
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.max(0, stepsCount) }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full flex-1 transition-colors ${i === centerActiveIndex ? "bg-blue-500" : "bg-gray-300"}`}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Left: Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <img src={logo} alt="Tugon" className="h-7 w-7 object-contain" />
          <span className="text-xl font-semibold tracking-tight">Tugon</span>
        </div>

  {/* Center nav hidden to avoid duplicating content under the progress overlay */}
  <nav className="hidden" aria-hidden="true" />

        {/* Right: Coin indicator (clickable) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCoinClick}
            aria-label="Coins"
            className="h-10 px-3 rounded-xl border-2 border-blue-500/70 bg-white shadow-sm inline-flex items-center gap-2 cursor-pointer transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 active:scale-[0.98]"
          >
            <CoinIcon className="h-5 w-5" />
            <span className="text-base font-semibold text-gray-900">{coins}</span>
          </button>
          <button className="inline-flex md:hidden p-2 rounded-md hover:bg-gray-100" aria-label="Open menu">
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
