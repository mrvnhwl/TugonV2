import type { SVGProps } from "react";
import logo from "./assets/images/brain.png"; // Tugon logo currently in the project

// Simple inline icons (no extra dependency)
const HomeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5v10a1.5 1.5 0 0 0 1.5 1.5H10v-6h4v6h3.5A1.5 1.5 0 0 0 19 19.5v-10" />
  </svg>
);

const TopicsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="3" y="4.5" width="8.5" height="6.5" rx="1.2" />
    <rect x="12.5" y="4.5" width="8.5" height="6.5" rx="1.2" />
    <rect x="3" y="13" width="8.5" height="6.5" rx="1.2" />
    <rect x="12.5" y="13" width="8.5" height="6.5" rx="1.2" />
  </svg>
);

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

type NavbarProps = { coins?: number; onCoinClick?: () => void };

export default function TugonSenseNavbar({ coins = 2, onCoinClick }: NavbarProps) {
  return (
    <div className="w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <img src={logo} alt="Tugon" className="h-7 w-7 object-contain" />
          <span className="text-xl font-semibold tracking-tight">Tugon</span>
        </div>

        {/* Center: Nav */}
        <nav className="hidden sm:flex items-center gap-6 text-[15px] font-medium text-gray-800">
          <a href="#" className="inline-flex items-center gap-2 hover:text-gray-900">
            <HomeIcon className="h-4 w-4" />
            Home
          </a>
          <a href="#" className="inline-flex items-center gap-2 hover:text-gray-900">
            <TopicsIcon className="h-4 w-4" />
            Topics
          </a>
        </nav>

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
