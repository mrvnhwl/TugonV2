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
  { label: "Class Reports", to: "/student-progress" },
  { label: "Student Progress", to: "/student-progress" },
  { label: "Manage Sections", to: "/teacherHome" },
];

const lottieOptions = (animationData: LottieAny) => ({
  loop: true, autoplay: true, animationData,
  rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
});

type SectionRow = {
  id: string;
  name: string;
  join_code: string | null;
  created_at: string;
  expires_at?: string | null;
};

const randomCode = () =>
  Array.from({ length: 6 }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
  ).join("");

// ---------------- Manage Sections ----------------
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

  // ✅ Helper: compute expiration
  const getExpirationStatus = (expiresAt?: string | null) => {
    if (!expiresAt) return { label: "No expiration", color: color.steel };
    const now = new Date();
    const exp = new Date(expiresAt);
    const diff = exp.getTime() - now.getTime();
    if (diff <= 0) return { label: "Expired", color: "#dc2626" }; // red
    const months = diff / (1000 * 60 * 60 * 24 * 30);
    if (months < 1) return { label: "Expiring soon", color: "#d97706" }; // yellow
    return { label: `${Math.floor(months)} month${months >= 2 ? "s" : ""} left`, color: "#059669" }; // green
  };

  const load = async () => {
    if (!teacherId && !teacherEmail) return;
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase
        .from("sections")
        .select("id, name, join_code, created_at, expires_at")
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

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6); // ⏳ 6 months expiration

    const insertOnce = async () => {
      return supabase
        .from("sections")
        .insert({
          name: name.trim(),
          created_by: teacherId,
          created_by_email: teacherEmail,
          join_code: randomCode(),
          expires_at: expiresAt.toISOString(),
        })
        .select("id, name, join_code, created_at, expires_at")
        .single();
    };

    try {
      let { data, error }: any = await insertOnce();
      if (error?.code === "23505") ({ data, error } = await insertOnce());
      if (error) throw error;

      setSections((prev) => [...prev, data as SectionRow]);
      setName("");
      setMsg("Section created (expires in 6 months).");
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
        .select("id, name, join_code, created_at, expires_at")
        .single();
      if (error) throw error;
      setSections((prev) => prev.map((s) => (s.id === id ? (data as SectionRow) : s)));
      setMsg("Join code regenerated.");
    } catch (e: any) {
      setErr(e?.message ?? "Could not regenerate code.");
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

  return (
    <div className="rounded-3xl p-5 sm:p-6 shadow-xl ring-1 mt-8" style={{ background: "#fff", borderColor: `${color.mist}55` }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: color.deep }}>Manage Sections & Join Codes</h2>
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
          <div className="py-10 text-center text-sm" style={{ color: color.steel }}>Loading sections…</div>
        ) : sections.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: color.steel }}>No sections yet. Create your first one above.</div>
        ) : (
          <table className="min-w-[800px] w-full divide-y" style={{ borderColor: color.mist }}>
            <thead style={{ background: `${color.mist}11` }}>
              <tr>
                {["Name", "Join Code", "Created", "Expires", "Actions"].map((h) => (
                  <th key={h} className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: color.steel }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y" style={{ borderColor: color.mist }}>
              {sections.map((s) => {
                const { label, color: expColor } = getExpirationStatus(s.expires_at);
                return (
                  <tr key={s.id} className="hover:bg-gray-50/60">
                    <td className="px-4 sm:px-6 py-3 text-sm" style={{ color: color.deep }}>{s.name}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm font-mono" style={{ color: color.deep }}>{s.join_code ?? "—"}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm" style={{ color: color.steel }}>
                      {new Date(s.created_at).toLocaleDateString?.() || ""}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm font-medium" style={{ color: expColor }}>
                      {label}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => copyCode(s.join_code)}
                          className="rounded-lg border px-3 py-2 text-xs sm:text-sm"
                          style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
                        >
                          <Copy className="h-4 w-4 inline mr-1" /> Copy
                        </button>
                        <button
                          onClick={() => regenCode(s.id)}
                          disabled={busyId === s.id}
                          className="rounded-lg border px-3 py-2 text-xs sm:text-sm disabled:opacity-60"
                          style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
                        >
                          {busyId === s.id ? <Loader2 className="h-4 w-4 inline animate-spin" /> : <RefreshCcw className="h-4 w-4 inline mr-1" />} Regenerate
                        </button>
                        <button
                          onClick={() => removeSection(s.id)}
                          disabled={busyId === s.id}
                          className="rounded-lg border px-3 py-2 text-xs sm:text-sm disabled:opacity-60"
                          style={{ borderColor: color.mist, background: "#fff", color: "#b91c1c" }}
                        >
                          <Trash2 className="h-4 w-4 inline mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
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
          {/* Hero + Manage Sections */}
          <ManageSectionsCard />
        </div>
      </header>

      {/* Quick Links and Feature Section unchanged */}
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
      </main>

      <Footer />
    </div>
  );
}

export default TeacherHome;
