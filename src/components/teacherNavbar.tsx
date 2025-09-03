import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import color from "../styles/color"; // 👈 centralized palette

// Reusable Tugon logo (gradient badge + white "T")
function TugonLogo({ size = 32 }: { size?: number }) {
  const id = "tugonGradTeacher";
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

function TeacherNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => navigate("/");
  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("userType");
    navigate("/");
  };

  return (
    <nav
      className="shadow-lg sticky top-0 z-50"
      style={{ background: color.steel, color: "#fff", borderBottom: `1px solid ${color.ocean}` }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/teacherHome" className="flex items-center space-x-2">
              <TugonLogo size={32} />
              <span className="text-2xl font-bold tracking-tight" style={{ color: "#fff" }}>
                Tugon
              </span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus-visible:ring-2"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              style={{ color: "#fff" }}
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

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/teacherDashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium transition"
                  style={{ color: "#fff" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.mist)}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#fff")}
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-quiz"
                  className="px-3 py-2 rounded-md text-sm font-medium transition"
                  style={{ color: "#fff" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.mist)}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#fff")}
                >
                  Create Quiz
                </Link>
                <Link
                  to="/leaderboards"
                  className="px-3 py-2 rounded-md text-sm font-medium flex items-center transition"
                  style={{ color: "#fff" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.mist)}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#fff")}
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Leaderboards
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-semibold transition"
                  style={{ background: "#ef4444", color: "#fff" }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "0.95")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-4 py-2 rounded-md text-sm font-semibold transition"
                style={{ background: "#fff", color: color.steel }}
                onMouseOver={(e) => (e.currentTarget.style.background = `${color.mist}22`)}
                onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
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
                  to="/teacherDashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium transition"
                  style={{ color: "#fff" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.mist)}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#fff")}
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-quiz"
                  className="block px-3 py-2 rounded-md text-base font-medium transition"
                  style={{ color: "#fff" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.mist)}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#fff")}
                >
                  Create Quiz
                </Link>
                <Link
                  to="/leaderboards"
                  className="block px-3 py-2 rounded-md text-base font-medium flex items-center transition"
                  style={{ color: "#fff" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = color.mist)}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#fff")}
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Leaderboards
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 px-4 py-2 rounded-md text-base font-semibold transition"
                  style={{ background: "#ef4444", color: "#fff" }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "0.95")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full px-4 py-2 rounded-md text-base font-semibold transition"
                style={{ background: "#fff", color: color.steel }}
                onMouseOver={(e) => (e.currentTarget.style.background = `${color.mist}22`)}
                onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
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

export default TeacherNavbar;
