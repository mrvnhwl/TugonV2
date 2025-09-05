import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain, Play, BarChart, Users, Sparkles, ArrowRight,
  ShieldCheck, Clock, CheckCircle2, Copy, RefreshCcw,
  Plus, Loader2, Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import Lottie from "react-lottie";

import createAnimation from "../components/assets/animations/create.json";
import competeAnimation from "../components/assets/animations/comp.json";
import progressAnimation from "../components/assets/animations/progress.json";
import quizAnimation from "../components/assets/animations/quiz.json";

import color from "../styles/color";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

type LottieAny = any;

const features = [
  { title: "Create Quizzes Fast", description: "Build question sets with timers, scoring rules, and automatic answer keys.", icon: Brain, animation: createAnimation, link: "/create-quiz" },
  { title: "Run Live Sessions", description: "Host real-time quizzes with countdowns, locks, and instant feedback.", icon: Play, animation: quizAnimation, link: "/host" },
  { title: "Progress & Insights", description: "See class trends, item analysis, and exportable grade reports in seconds.", icon: BarChart, animation: progressAnimation, link: "/student-progress" },
  { title: "Boost Engagement", description: "Leaderboards and teams that motivate—without sacrificing learning goals.", icon: Users, animation: competeAnimation, link: "/teacherDashboard" },
];

// ✅ Only include links that exist in App routes
const quickLinks: { label: string; to: string }[] = [
  { label: "Create a Quiz", to: "/create-quiz" },
  { label: "Start Live Quiz", to: "/host" },
  { label: "Class Reports", to: "/teacherDashboard" },
  { label: "Student Progress", to: "/student-progress" },
  { label: "Manage Sections", to: "/teacherHome" },
];

const lottieOptions = (animationData: LottieAny) => ({
  loop: true, autoplay: true, animationData,
  rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
});

type SectionRow = { id: string; name: string; join_code: string | null; created_at: string; };

const randomCode = () =>
  Array.from({ length: 6 }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
  ).join("");

// ---------------- Manage Sections (uses BOTH created_by + created_by_email) ----------------
function ManageSectionsCard() {
  const { user } = useAuth();
  const teacherId = user?.id ?? "";
  const teacherEmail = user?.email ?? "";

  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    if (!teacherId && !teacherEmail) return;
    setLoading(true);
    setErr(null);
    try {
      // See sections owned via UUID (new rows) or email (legacy rows)
      const { data, error } = await supabase
        .from("sections")
        .select("id, name, join_code, created_at")
        .or(`created_by.eq.${teacherId},created_by_email.eq.${teacherEmail}`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setSections((data ?? []) as SectionRow[]);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load sections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, teacherEmail]);

  const createSection = async () => {
    setMsg(null);
    setErr(null);
    if (!teacherId || !teacherEmail) {
      setErr("Please sign in.");
      return;
    }
    if (!name.trim()) {
      setErr("Enter a section name.");
      return;
    }

    setLoading(true);

    const insertOnce = async () => {
      return supabase
        .from("sections")
        .insert({
          name: name.trim(),
          created_by: teacherId,          // UUID owner (preferred)
          created_by_email: teacherEmail, // Email owner (back-compat / RLS)
          join_code: randomCode(),
        })
        .select("id, name, join_code, created_at")
        .single();
    };

    try {
      let { data, error }: any = await insertOnce();
      if (error?.code === "23505") {
        // join_code unique collision → retry once
        ({ data, error } = await insertOnce());
      }
      if (error) throw error;

      setSections((prev) => [...prev, data as SectionRow]);
      setName("");
      setMsg("Section created.");
    } catch (e: any) {
      setErr(e?.message ?? "Could not create section.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async (code?: string | null) => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setMsg("Join code copied!");
    setTimeout(() => setMsg(null), 2000);
  };

  const regenCode = async (id: string) => {
    setBusyId(id);
    setMsg(null);
    setErr(null);
    try {
      const { data, error } = await supabase
        .from("sections")
        .update({ join_code: randomCode() })
        .eq("id", id)
        .select("id, name, join_code, created_at")
        .single();
      if (error) throw error;
      setSections((prev) => prev.map((s) => (s.id === id ? (data as SectionRow) : s)));
      setMsg("Join code regenerated.");
    } catch (e: any) {
      if (e?.code === "23505") {
        const retry = await supabase
          .from("sections")
          .update({ join_code: randomCode() })
          .eq("id", id)
          .select("id, name, join_code, created_at")
          .single();
        if (retry.error) setErr(retry.error.message);
        else {
          setSections((prev) => prev.map((s) => (s.id === id ? (retry.data as SectionRow) : s)));
          setMsg("Join code regenerated.");
        }
      } else {
        setErr(e?.message ?? "Could not regenerate code.");
      }
    } finally {
      setBusyId(null);
    }
  };

  const removeSection = async (id: string) => {
    setBusyId(id);
    setMsg(null);
    setErr(null);
    try {
      const { error } = await supabase.from("sections").delete().eq("id", id);
      if (error) throw error;
      setSections((prev) => prev.filter((s) => s.id !== id));
      setMsg("Section deleted.");
    } catch (e: any) {
      setErr(e?.message ?? "Could not delete section.");
    } finally {
      setBusyId(null);
    }
  };

  const total = sections.length;
  const createdLabel = useMemo(() => (total === 1 ? "section" : "sections"), [total]);

  return (
    <div
      className="rounded-3xl p-5 sm:p-6 shadow-xl ring-1 mt-8"
      style={{ background: "#fff", borderColor: `${color.mist}55` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: color.deep }}>
            Manage Sections & Join Codes
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: color.steel }}>
            Create a section, share its <strong>6-character code</strong>, or regenerate a new one anytime.
          </p>
        </div>

        <div className="flex w-full sm:w-auto gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New section name"
            className="flex-1 sm:w-64 rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: color.mist, background: "#fff", color: color.deep }}
          />
          <button
            onClick={createSection}
            disabled={loading || !name.trim()}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition disabled:opacity-60"
            style={{ background: color.teal, color: "#fff" }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Plus className="h-4 w-4 mr-2" />Create</>)}
          </button>
        </div>
      </div>

      {(msg || err) && (
        <div className="mt-3 text-sm">
          {msg && <span style={{ color: "#065f46" }}>{msg}</span>}
          {err && <span style={{ color: "#b91c1c" }}>{err}</span>}
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        {loading && sections.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: color.steel }}>
            Loading sections…
          </div>
        ) : sections.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: color.steel }}>
            No sections yet. Create your first one above.
          </div>
        ) : (
          <table className="min-w-[720px] w-full divide-y" style={{ borderColor: color.mist }}>
            <thead style={{ background: `${color.mist}11` }}>
              <tr>
                {["Name", "Join Code", "Created", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: color.steel }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y" style={{ borderColor: color.mist }}>
              {sections.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60">
                  <td className="px-4 sm:px-6 py-3 text-sm" style={{ color: color.deep }}>
                    {s.name}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm" style={{ color: color.deep, letterSpacing: "0.12em" }}>
                    {s.join_code ?? "—"}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm" style={{ color: color.steel }}>
                    {new Date(s.created_at).toLocaleDateString?.() || ""}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => copyCode(s.join_code)}
                        className="rounded-lg border px-3 py-2 text-xs sm:text-sm"
                        style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
                        title="Copy join code"
                      >
                        <Copy className="h-4 w-4 inline mr-1" /> Copy
                      </button>
                      <button
                        onClick={() => regenCode(s.id)}
                        disabled={busyId === s.id}
                        className="rounded-lg border px-3 py-2 text-xs sm:text-sm disabled:opacity-60"
                        style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
                        title="Regenerate join code"
                      >
                        {busyId === s.id ? (
                          <Loader2 className="h-4 w-4 inline animate-spin" />
                        ) : (
                          <RefreshCcw className="h-4 w-4 inline mr-1" />
                        )}
                        Regenerate
                      </button>
                      <button
                        onClick={() => removeSection(s.id)}
                        disabled={busyId === s.id}
                        className="rounded-lg border px-3 py-2 text-xs sm:text-sm disabled:opacity-60"
                        style={{ borderColor: color.mist, background: "#fff", color: "#b91c1c" }}
                        title="Delete section"
                      >
                        <Trash2 className="h-4 w-4 inline mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={4}
                  className="px-4 sm:px-6 py-3 text-xs"
                  style={{ color: color.steel }}
                >
                  {sections.length} {sections.length === 1 ? "section" : "sections"} total
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}

// ---------------- Page ----------------
function TeacherHome() {
  return (
    <div
      className="relative flex flex-col min-h-screen"
      style={{ background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}05)` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(60% 40% at 50% -10%, ${color.aqua}33, transparent 60%), radial-gradient(40% 30% at 80% 10%, ${color.teal}22, transparent 60%)`,
        }}
      />
      <header className="w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
          <div className="flex flex-col-reverse items-center gap-10 md:grid md:grid-cols-2 md:items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left"
            >
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm backdrop-blur"
                style={{ background: "#fff", border: `1px solid ${color.mist}`, color: color.teal }}
              >
                <Sparkles className="h-4 w-4" />
                Built for Grade 11 General Mathematics • Teachers
              </span>
              <h1
                className="mt-4 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
                style={{ color: color.deep }}
              >
                Teach smarter— <span style={{ color: color.teal }}>with less busywork.</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg md:max-w-xl" style={{ color: color.steel }}>
                Tugon helps you create, deliver, and analyze quizzes—so you can
                focus on teaching while students stay engaged.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <Link
                  to="/teacherDashboard"
                  className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold shadow-md transition"
                  style={{ background: color.teal, color: "#fff" }}
                >
                  Go to dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/create-quiz"
                  className="inline-flex items-center justify-center rounded-xl border px-6 py-3 font-semibold transition"
                  style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
                >
                  Create a quiz
                </Link>
              </div>
              <ul className="mt-6 flex flex-col sm:flex-row gap-3 text-sm" style={{ color: color.steel }}>
                <li className="flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5" style={{ color: "#059669" }} /> No ads, no distractions
                </li>
                <li className="flex items-center">
                  <ShieldCheck className="mr-2 h-5 w-5" style={{ color: color.teal }} /> Secure student data
                </li>
                <li className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" style={{ color: color.aqua }} /> Save hours each week
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full"
            >
              <div
                className="mx-auto max-w-md md:max-w-none rounded-3xl p-4 shadow-xl ring-1 backdrop-blur"
                style={{ background: "#fff", borderColor: `${color.mist}55` }}
              >
                <div className="rounded-2xl overflow-hidden">
                  <Lottie options={lottieOptions(createAnimation)} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs" style={{ color: color.steel }}>
                  <div className="rounded-lg border bg-white px-3 py-2">
                    Sections: <span className="font-semibold" style={{ color: color.deep }}>3</span>
                  </div>
                  <div className="rounded-lg border bg-white px-3 py-2">
                    Submissions: <span className="font-semibold" style={{ color: color.deep }}>86</span>
                  </div>
                  <div className="rounded-lg border bg-white px-3 py-2">
                    Avg Score: <span className="font-semibold" style={{ color: color.deep }}>78%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Manage Sections */}
          <ManageSectionsCard />
        </div>
      </header>

      <main className="flex-grow pb-8 sm:pb-10">
        {/* Quick Links */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: color.deep }}>Quick Links</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickLinks.map((q) => (
              <Link
                key={q.label}
                to={q.to}
                className="rounded-full border px-4 py-2 text-sm transition"
                style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
              >
                {q.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Feature cards */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 * index }}
                className="group overflow-hidden rounded-3xl bg-white shadow-md ring-1 transition"
                style={{ borderColor: `${color.mist}33` }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
                  <div className="col-span-2 p-6 sm:p-8">
                    <div className="inline-flex items-center justify-center rounded-xl p-3" style={{ background: `${color.teal}22` }}>
                      <feature.icon className="h-6 w-6" style={{ color: color.teal }} />
                    </div>
                    <h3 className="mt-4 text-lg sm:text-xl font-semibold" style={{ color: color.deep }}>
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base" style={{ color: color.steel }}>
                      {feature.description}
                    </p>
                    <Link
                      to={feature.link}
                      className="mt-4 inline-flex items-center font-medium hover:underline"
                      style={{ color: color.teal }}
                    >
                      Try this <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                  <div className="sm:border-l bg-gradient-to-b p-4 sm:p-6" style={{ borderColor: `${color.mist}33`, background: `${color.mist}11` }}>
                    <div className="rounded-2xl overflow-hidden">
                      <Lottie options={lottieOptions(feature.animation)} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default TeacherHome;
