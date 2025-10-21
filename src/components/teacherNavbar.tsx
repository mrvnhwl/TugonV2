import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import color from "../styles/color";

// Tugon logo (gradient badge + white "T")
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

function Initials({ email, size = 28 }: { email?: string | null; size?: number }) {
  const initials = useMemo(() => {
    if (!email) return "U";
    const base = email.split("@")[0] || "U";
    return base
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
        background: `${color.aqua}20`,
        color: "#fff",
        boxShadow: `inset 0 0 0 2px ${color.aqua}55`,
      }}
    >
      {initials || "U"}
    </div>
  );
}

function NavItem({
  to,
  children,
  onNavigate,
}: {
  to: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className="px-3 py-2 rounded-md text-sm font-medium transition outline-none"
      style={({ isActive }) => ({
        color: "#fff",
        background: isActive ? `${color.mist}22` : "transparent",
      })}
      onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}40`)}
      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${color.mist}22`)}
      onMouseLeave={(e) => {
        const isActive =
          (e.currentTarget.getAttribute("aria-current") as string | null) === "page";
        e.currentTarget.style.background = isActive ? `${color.mist}22` : "transparent";
      }}
      aria-current={({ isActive }) => (isActive ? "page" : undefined)}
    >
      {children}
    </NavLink>
  );
}

function TeacherNavbar({ className = "" }: { className?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hideNav, setHideNav] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide when body has "hide-navbar" (e.g., full-screen quiz)
  useEffect(() => {
    const update = () => setHideNav(document.body.classList.contains("hide-navbar"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Close mobile nav when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  if (hideNav) return null;

  const handleSignIn = () => navigate("/userTypeSelection");
  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("userType");
    navigate("/");
  };

  const closeMenuOnNavigate = () => setMenuOpen(false);

  return (
    <nav
      className={`shadow-lg sticky top-0 z-50 ${className}`}
      role="navigation"
      aria-label="Teacher main"
      style={{ background: color.steel, color: "#fff", borderBottom: `1px solid ${color.ocean}` }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <Link to="/teacherHome" className="flex items-center space-x-2">
              <TugonLogo size={32} />
              <span className="text-2xl font-bold tracking-tight truncate" style={{ color: "#fff" }}>
                Tugon
              </span>
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <NavItem to="/teacherDashboard" onNavigate={closeMenuOnNavigate}>
                  Dashboard
                </NavItem>
                <NavItem to="/create-quiz" onNavigate={closeMenuOnNavigate}>
                  Create Quiz
                </NavItem>
                <NavItem to="/manage-sections" onNavigate={closeMenuOnNavigate}>
                  Manage Sections
                </NavItem>
                <NavItem to="/student-progress" onNavigate={closeMenuOnNavigate}>
                  Student Progress
                </NavItem>
                {/* NEW: Manage Topics */}
                <NavItem to="/manage-topics" onNavigate={closeMenuOnNavigate}>
                  Manage Topics
                </NavItem>

                <span aria-hidden className="mx-2" style={{ width: 1, height: 24, background: "#ffffff33" }} />

                <div className="flex items-center gap-2">
                  <Initials email={user.email} />
                  <span className="text-sm font-medium truncate max-w:[160px] opacity-90">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-semibold transition"
                    style={{ background: "#ef4444", color: "#fff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.95")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px #ef444455`)}
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-4 py-2 rounded-md text-sm font-semibold transition"
                style={{ background: "#fff", color: color.steel }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${color.mist}22`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}40`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus-visible:ring-2"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="teacher-mobile-menu"
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
        </div>

        {/* Mobile menu (animated height) */}
        <div
          id="teacher-mobile-menu"
          ref={menuRef}
          className="md:hidden overflow-hidden transition-[max-height] duration-300 ease-out"
          style={{ maxHeight: menuOpen ? 420 : 0 }}
        >
          <div className="mt-2 space-y-1 pb-4">
            {user ? (
              <>
                <NavItem to="/teacherDashboard" onNavigate={closeMenuOnNavigate}>
                  Dashboard
                </NavItem>
                <NavItem to="/create-quiz" onNavigate={closeMenuOnNavigate}>
                  Create Quiz
                </NavItem>
                <NavItem to="/student-progress" onNavigate={closeMenuOnNavigate}>
                  Student Progress
                </NavItem>
                {/* NEW: Manage Topics (mobile) */}
                <NavItem to="/manage-topics" onNavigate={closeMenuOnNavigate}>
                  Manage Topics
                </NavItem>

                <div className="px-2 pt-2 flex items-center gap-2">
                  <Initials email={user.email} />
                  <span className="text-sm font-medium opacity-90">{user.email}</span>
                </div>

                <div className="px-2">
                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 px-4 py-2 rounded-md text-base font-semibold transition"
                    style={{ background: "#ef4444", color: "#fff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.95")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="px-2">
                <button
                  onClick={handleSignIn}
                  className="w-full px-4 py-2 rounded-md text-base font-semibold transition"
                  style={{ background: "#fff", color: color.steel }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${color.mist}22`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
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

export default TeacherNavbar;
