import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Sword } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import color from "../styles/color"; // 👈 centralized palette

// Simple inline Tugon logo (gradient badge + white "T")
function TugonLogo({ size = 32 }: { size?: number }) {
  const id = "tugonGrad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Tugon logo"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color.teal} />
          <stop offset="100%" stopColor={color.aqua} />
        </linearGradient>
      </defs>
      {/* rounded square badge */}
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#${id})`} />
      {/* "T" glyph built from two rectangles */}
      <rect x="7" y="9" width="18" height="4" rx="2" fill="#fff" />
      <rect x="14" y="13" width="4" height="12" rx="2" fill="#fff" />
    </svg>
  );
}

function StudentNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem("userType");
    navigate("/");
  };

  const handleSignIn = () => {
    navigate("/userTypeSelection");
  };

  return (
    <nav
      className="shadow-lg sticky top-0 z-50"
      style={{ background: "#fff", borderBottom: `1px solid ${color.mist}44` }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/studentHome" className="flex items-center space-x-2 group">
              <TugonLogo size={32} />
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ color: color.deep }}
              >
                Tugon
              </span>
            </Link>
          </div>

          {/* Hamburger menu button (mobile) */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus-visible:ring-2"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              style={{
                color: color.teal,
                boxShadow: "none",
              }}
            >
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/studentDashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium transition"
                  style={{ color: color.steel }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.teal)}
                  onMouseOut={(e) => (e.currentTarget.style.color = color.steel)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/tugonSense"
                  className="px-3 py-2 rounded-md text-sm font-medium transition"
                  style={{ color: color.steel }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.teal)}
                  onMouseOut={(e) => (e.currentTarget.style.color = color.steel)}
                >
                  TugonSense
                </Link>
                <Link
                  to="/challenge"
                  className="px-3 py-2 rounded-md text-sm font-medium flex items-center transition"
                  style={{ color: color.steel }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.teal)}
                  onMouseOut={(e) => (e.currentTarget.style.color = color.steel)}
                >
                  <Sword className="h-4 w-4 mr-1" />
                  Challenge
                </Link>
                <Link
                  to="/leaderboards"
                  className="px-3 py-2 rounded-md text-sm font-medium flex items-center transition"
                  style={{ color: color.steel }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.teal)}
                  onMouseOut={(e) => (e.currentTarget.style.color = color.steel)}
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Leaderboards
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-md text-sm font-semibold transition"
                  style={{
                    background: color.teal,
                    color: "#fff",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "0.95")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-4 py-2 rounded-md text-sm font-semibold transition"
                style={{ background: color.teal, color: "#fff" }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.95")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 space-y-1 pb-4">
            {user ? (
              <>
                <Link
                  to="/studentDashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium transition"
                  style={{ color: color.steel }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.teal)}
                  onMouseOut={(e) => (e.currentTarget.style.color = color.steel)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/tugonSense"
                  className="block px-3 py-2 rounded-md text-base font-medium transition"
                  style={{ color: color.steel }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.teal)}
                  onMouseOut={(e) => (e.currentTarget.style.color = color.steel)}
                >
                  TugonSense
                </Link>
                <Link
                  to="/challenge"
                  className="block px-3 py-2 rounded-md text-base font-medium flex items-center transition"
                  style={{ color: color.steel }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.teal)}
                  onMouseOut={(e) => (e.currentTarget.style.color = color.steel)}
                >
                  <Sword className="h-4 w-4 mr-1" />
                  Challenge
                </Link>
                <Link
                  to="/leaderboards"
                  className="block px-3 py-2 rounded-md text-base font-medium flex items-center transition"
                  style={{ color: color.steel }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.teal)}
                  onMouseOut={(e) => (e.currentTarget.style.color = color.steel)}
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Leaderboards
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full mt-2 px-4 py-2 rounded-md text-base font-semibold transition"
                  style={{ background: color.teal, color: "#fff" }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "0.95")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full px-4 py-2 rounded-md text-base font-semibold transition"
                style={{ background: color.teal, color: "#fff" }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.95")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default StudentNavbar;
