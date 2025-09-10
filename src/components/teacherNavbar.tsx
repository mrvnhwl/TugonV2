import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import color from "../styles/color"; // centralized palette

// Reusable Tugon logo (gradient badge + white "T")
function TugonLogo({ size = 32 }: { size?: number }) {
  const id = "tugonGradTeacher";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Tugon logo">
      <defs>
        <linearGradient id={id} x1="0" y="0" x2="1" y2="1">
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
  const [hideNav, setHideNav] = useState(false); // ⬅️ react to body class
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Watch <body> class for "hide-navbar"
  useEffect(() => {
    const update = () => setHideNav(document.body.classList.contains("hide-navbar"));
    update(); // initial
    const obs = new MutationObserver(update);
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // If hidden (e.g., during Quiz), render nothing
  if (hideNav) return null;

  const handleSignIn = () => navigate("/userTypeSelection");
  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("userType");
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (active: boolean) => ({
    color: "#fff",
    background: active ? `${color.mist}22` : "transparent",
    borderRadius: "0.5rem",
  });

  const hoverHandlers = (el: HTMLAnchorElement, active: boolean) => {
    if (active) return;
    el.style.color = el.dataset._hovering === "1" ? color.mist : "#fff";
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
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  to="/teacherDashboard"
                  aria-current={isActive("/teacherDashboard") ? "page" : undefined}
                  className="px-3 py-2 rounded-md text-sm font-medium transition"
                  style={linkStyle(isActive("/teacherDashboard"))}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLAnchorElement).dataset._hovering = "1";
                    hoverHandlers(e.currentTarget, isActive("/teacherDashboard"));
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLAnchorElement).dataset._hovering = "0";
                    hoverHandlers(e.currentTarget, isActive("/teacherDashboard"));
                  }}
                >
                  Dashboard
                </Link>

                <Link
                  to="/create-quiz"
                  aria-current={isActive("/create-quiz") ? "page" : undefined}
                  className="px-3 py-2 rounded-md text-sm font-medium transition"
                  style={linkStyle(isActive("/create-quiz"))}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLAnchorElement).dataset._hovering = "1";
                    hoverHandlers(e.currentTarget, isActive("/create-quiz"));
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLAnchorElement).dataset._hovering = "0";
                    hoverHandlers(e.currentTarget, isActive("/create-quiz"));
                  }}
                >
                  Create Quiz
                </Link>

                {/* Student Progress */}
                <Link
                  to="/student-progress"
                  aria-current={isActive("/student-progress") ? "page" : undefined}
                  className="px-3 py-2 rounded-md text-sm font-medium transition"
                  style={linkStyle(isActive("/student-progress"))}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLAnchorElement).dataset._hovering = "1";
                    hoverHandlers(e.currentTarget, isActive("/student-progress"));
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLAnchorElement).dataset._hovering = "0";
                    hoverHandlers(e.currentTarget, isActive("/student-progress"));
                  }}
                >
                  Student Progress
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
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium transition"
                  style={{ color: "#fff", background: isActive("/teacherDashboard") ? `${color.mist}22` : "transparent" }}
                >
                  Dashboard
                </Link>

                <Link
                  to="/create-quiz"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium transition"
                  style={{ color: "#fff", background: isActive("/create-quiz") ? `${color.mist}22` : "transparent" }}
                >
                  Create Quiz
                </Link>

                {/* Student Progress (mobile) */}
                <Link
                  to="/student-progress"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium transition"
                  style={{ color: "#fff", background: isActive("/student-progress") ? `${color.mist}22` : "transparent" }}
                >
                  Student Progress
                </Link>

                <button
                  onClick={async () => {
                    await handleLogout();
                    setMenuOpen(false);
                  }}
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
