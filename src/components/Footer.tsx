import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Globe,
  Mail,
} from "lucide-react";
import { supabase } from "../lib/supabase"; // adjust path if needed

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const getUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setIsLoggedIn(true);

        // check if user is in profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "teacher") {
          setRole("teacher");
        } else {
          setRole("student"); // fallback if no teacher role
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    getUserRole();
  }, []);

  const nav = {
    product: [
      { label: "Overview", to: "/about" },
      { label: "Question Bank", to: "/teacherDashboard" },
      { label: "Live Quizzes", to: "/teacherDashboard" },
      { label: "Analytics", to: "/teacherDashboard" },
    ],
    teachers: [
      { label: "Create a Quiz", to: "/create-quiz" },
      { label: "Class Reports", to: "/student-progress" },
      { label: "Export Grades", to: "/student-progress" },
      { label: "Invite Students", to: "/teacherDashboard" },
    ],
    students: [
      { label: "Popular Topics", to: "/studentDashboard" },
      { label: "Daily Streak", to: "/studentDashboard" },
      { label: "Leaderboards", to: "/leaderboards" },
      { label: "Syllabus", to: "/studentDashboard" },
    ],
    resources: [
      { label: "Help Center", to: "/help" },
      { label: "Guides", to: "/guides" },
      { label: "Blog", to: "/blog" },
      { label: "Status", to: "/status" },
    ],
    company: [
      { label: "About", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact" },
      { label: "Press", to: "/press" },
    ],
  };

  return (
    <footer
      className="w-full border-t border-gray-200/70 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black dark:border-gray-800"
      aria-labelledby="site-footer"
    >
      {/* Top: Brand + CTA */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 py-10 sm:py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="site-footer" className="sr-only">
              Site Footer
            </h2>
            <Link to="/" className="inline-flex items-center group">
              <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:opacity-90 dark:text-white">
                Tugon
              </span>
              <span className="ml-2 rounded-full bg-indigo-600/10 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-600/20 dark:text-indigo-300 dark:ring-indigo-500/20">
                Beta
              </span>
            </Link>
            <p className="mt-2 max-w-xl text-sm text-gray-600 dark:text-gray-400">
              Interactive learning for SHS General Mathematics—built for teachers and students.
            </p>
          </div>

          {/* Simple newsletter sign-up */}
          <form
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/70 p-2 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/40"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Subscribe to newsletter"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="Get product updates"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none ring-0 transition placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-800 dark:bg-gray-900 dark:placeholder:text-gray-500 dark:focus:border-indigo-800 dark:focus:ring-indigo-900/40"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:hover:bg-indigo-600"
              >
                Subscribe
              </button>
            </div>
            <p className="px-1 pt-1 text-xs text-gray-500 dark:text-gray-500">
              No spam. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>

      {/* Middle: Link columns */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
          <NavGroup title="Product" links={nav.product} />

          {/* Show role-based sections */}
          {/* Show teacher links only if logged in + role = teacher */}
          {isLoggedIn && role === "teacher" && (
            <NavGroup title="For Teachers" links={nav.teachers} />
          )}

          {/* Show student links only if logged in + NOT teacher */}
          {isLoggedIn && role !== "teacher" && (
            <NavGroup title="For Students" links={nav.students} />
          )}
          
          <NavGroup title="Resources" links={nav.resources} />
          <NavGroup title="Company" links={nav.company} />
        </div>
      </div>

      {/* Bottom bar (unchanged) */}
      <div className="border-t border-gray-200/70 dark:border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          {/* Legal */}
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © {year} Tugon. All rights reserved.
          </p>

          {/* Locale + Social */}
          <div className="flex items-center gap-4">
            {/* Language selector (static) */}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-900/60"
              aria-label="Change language"
            >
              <Globe className="h-4 w-4" />
              English
            </button>

            {/* Socials */}
            <nav aria-label="Social media" className="flex items-center gap-2">
              <SocialIcon
                href="https://facebook.com"
                label="Facebook"
                Icon={Facebook}
                hover="hover:text-blue-600"
              />
              <SocialIcon
                href="https://instagram.com"
                label="Instagram"
                Icon={Instagram}
                hover="hover:text-pink-500"
              />
              <SocialIcon
                href="https://twitter.com"
                label="Twitter"
                Icon={Twitter}
                hover="hover:text-sky-500"
              />
              <SocialIcon
                href="https://youtube.com"
                label="YouTube"
                Icon={Youtube}
                hover="hover:text-red-500"
              />
              <SocialIcon
                href="https://linkedin.com"
                label="LinkedIn"
                Icon={Linkedin}
                hover="hover:text-blue-700"
              />
            </nav>
          </div>
        </div>

        {/* Mini legal row */}
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between dark:text-gray-500">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link className="hover:text-gray-700 dark:hover:text-gray-300" to="/terms">
                Terms
              </Link>
              <Link className="hover:text-gray-700 dark:hover:text-gray-300" to="/privacy">
                Privacy
              </Link>
              <Link className="hover:text-gray-700 dark:hover:text-gray-300" to="/cookies">
                Cookies
              </Link>
              <Link className="hover:text-gray-700 dark:hover:text-gray-300" to="/accessibility">
                Accessibility
              </Link>
            </div>
            <p className="opacity-80">Made with ♥ for learners & teachers</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

/** ----- Small helpers ----- */
type NavLink = { label: string; to: string };

const NavGroup: React.FC<{ title: string; links: NavLink[] }> = ({
  title,
  links,
}) => (
  <nav aria-label={title}>
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
      {title}
    </h3>
    <ul className="mt-3 space-y-2">
      {links.map((l) => (
        <li key={l.label}>
          <Link
            to={l.to}
            className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);

const SocialIcon: React.FC<{
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  hover?: string;
}> = ({ href, label, Icon, hover = "" }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`inline-flex items-center justify-center rounded-full p-2 text-gray-500 transition hover:bg-gray-100 ${hover} focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-gray-400 dark:hover:bg-gray-900`}
  >
    <Icon className="h-4 w-4" />
    <span className="sr-only">{label}</span>
  </a>
);

export default Footer;
