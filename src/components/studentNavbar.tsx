import React, { useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Trophy, Sword } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import color from "../styles/color";

// Inline Tugon logo (gradient badge + white "T")
function TugonLogo({ size = 32 }: { size?: number }) {
  const id = "tugonGrad";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Tugon logo">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color.teal} />
          <stop offset="100%" stopColor={color.aqua} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id})`} />
      <rect x="7" y="9" width="18" height="4" rx="2" fill="#fff" />
      <rect x="14" y="13" width="4" height="12" rx="2" fill="#fff" />
    </svg>
  );
}

function Initials({ email, size = 28 }: { email?: string | null; size?: number }) {
  const initials = useMemo(() => {
    if (!email) return "U";
    const name = email.split("@")[0] || "U";
    return name
      .split(/[._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("");
  }, [email]);

  return (
    <div
      aria-hidden
      className="inline-flex items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        background: `${color.teal}20`,
        color: color.teal,
      }}
    >
      {initials || "U"}
    </div>
  );
}

/** Reusable nav item with active + hover styles */
function NavItem({
  to,
  children,
  icon,
  onNavigate,
}: {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className="px-3 py-2 rounded-md text-sm font-medium transition outline-none"
      style={{
        color: isActive ? color.teal : color.steel,
        background: isActive ? `${color.teal}10` : "transparent",
        boxShadow: "none",
      }}
      onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)}
      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.color = color.teal;
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.color = color.steel;
      }}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="inline-flex items-center">
        {icon ? <span className="mr-1.5">{icon}</span> : null}
        {children}
      </span>
    </NavLink>
  );
}

function StudentNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem("userType");
    navigate("/");
  };

  const handleSignIn = () => navigate("/userTypeSelection");

  // Close mobile menu whenever we navigate via a NavItem
  const closeMenuOnNavigate = () => setMenuOpen(false);

  return (
    <nav
      className="shadow-lg sticky top-0 z-50"
      role="navigation"
      aria-label="Main"
      style={{ background: "#fff", borderBottom: `1px solid ${color.mist}44` }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <Link to="/studentHome" className="flex items-center space-x-2 group">
              <TugonLogo size={32} />
              <span className="text-2xl font-bold tracking-tight truncate" style={{ color: color.deep }}>
                Tugon
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <NavItem to="/studentDashboard" onNavigate={closeMenuOnNavigate}>
                  Dashboard
                </NavItem>
                <NavItem to="/tugonSense" onNavigate={closeMenuOnNavigate}>
                  TugonSense
                </NavItem>
                <NavItem
                  to="/challenge"
                  onNavigate={closeMenuOnNavigate}
                  icon={<Sword className="h-4 w-4" />}
                >
                  Challenge
                </NavItem>
                <NavItem
                  to="/leaderboards"
                  onNavigate={closeMenuOnNavigate}
                  icon={<Trophy className="h-4 w-4" />}
                >
                  Leaderboards
                </NavItem>

                {/* Divider */}
                <span
                  aria-hidden
                  className="mx-2"
                  style={{ width: 1, height: 24, background: `${color.mist}66` }}
                />

                {/* User chip + signout */}
                <div className="flex items-center gap-2">
                  <Initials email={user.email} />
                  <span className="text-sm font-medium truncate max-w-[160px]" style={{ color: color.steel }}>
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2 rounded-md text-sm font-semibold transition"
                    style={{ background: color.teal, color: "#fff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.95")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)}
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-4 py-2 rounded-md text-sm font-semibold transition"
                style={{ background: color.teal, color: "#fff" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.95")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus-visible:ring-2"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              style={{ color: color.teal }}
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu (animated height) */}
        <div
          id="mobile-menu"
          ref={menuRef}
          className="md:hidden overflow-hidden transition-[max-height] duration-300 ease-out"
          style={{
            maxHeight: menuOpen ? 400 : 0,
          }}
        >
          <div className="mt-2 space-y-1 pb-4">
            {user ? (
              <>
                <NavItem to="/studentDashboard" onNavigate={closeMenuOnNavigate}>
                  Dashboard
                </NavItem>
                <NavItem to="/tugonSense" onNavigate={closeMenuOnNavigate}>
                  TugonSense
                </NavItem>
                <NavItem to="/challenge" onNavigate={closeMenuOnNavigate} icon={<Sword className="h-4 w-4" />}>
                  Challenge
                </NavItem>
                <NavItem
                  to="/leaderboards"
                  onNavigate={closeMenuOnNavigate}
                  icon={<Trophy className="h-4 w-4" />}
                >
                  Leaderboards
                </NavItem>

                <div className="px-2 pt-2 flex items-center gap-2">
                  <Initials email={user.email} />
                  <span className="text-sm font-medium" style={{ color: color.steel }}>
                    {user.email}
                  </span>
                </div>

                <div className="px-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full mt-2 px-4 py-2 rounded-md text-base font-semibold transition"
                    style={{ background: color.teal, color: "#fff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.95")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)}
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="px-2">
                <button
                  onClick={handleSignIn}
                  className="w-full px-4 py-2 rounded-md text-base font-semibold transition"
                  style={{ background: color.teal, color: "#fff" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.95")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default StudentNavbar;
