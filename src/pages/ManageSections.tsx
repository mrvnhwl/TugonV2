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
  starts_at?: string | null;
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
  const [startsAtInput, setStartsAtInput] = useState<string>("");
  const [expiresAtInput, setExpiresAtInput] = useState<string>("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Regenerate modal state
  const [regenModalOpenFor, setRegenModalOpenFor] = useState<string | null>(null);
  const [deleteModalOpenFor, setDeleteModalOpenFor] = useState<string | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<SectionRow | null>(null);
  const [modalJoinCode, setModalJoinCode] = useState<string>("");
  const [modalStartsAtInput, setModalStartsAtInput] = useState<string>("");
  const [modalExpiresAtInput, setModalExpiresAtInput] = useState<string>("");
  const [regenLoading, setRegenLoading] = useState(false);

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

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString?.([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) || d.toString();
    } catch {
      return String(iso);
    }
  };

  const load = async () => {
    if (!teacherId && !teacherEmail) return;
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase
        .from("sections")
        .select("id, name, join_code, created_at, starts_at, expires_at")
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

    // determine starts_at and expires_at from inputs (fallback to sensible defaults)
    const startsAt = startsAtInput ? new Date(startsAtInput) : new Date();
    if (!expiresAtInput) {
      setErr("Please enter an expiration date and time.");
      setLoading(false);
      return;
    }
    const expiresAt = new Date(expiresAtInput);
    // validation: expires must be after starts
    if (expiresAt.getTime() <= startsAt.getTime()) {
      setErr("Expiration must be after the start time.");
      setLoading(false);
      return;
    }

    const insertOnce = async () => {
      return supabase
        .from("sections")
        .insert({
          name: name.trim(),
          created_by: teacherId,
          created_by_email: teacherEmail,
          join_code: randomCode(),
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select("id, name, join_code, created_at, starts_at, expires_at")
        .single();
    };

    try {
      let { data, error }: any = await insertOnce();
      if (error?.code === "23505") ({ data, error } = await insertOnce());
      if (error) throw error;

  setSections((prev) => [...prev, data as SectionRow]);
  setName("");
  setStartsAtInput("");
  setExpiresAtInput("");
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
    // Deprecated: regeneration now handled via modal. Keep for backward compat if needed.
    setBusyId(id);
    setMsg(null);
    setErr(null);
    try {
      const { data, error } = await supabase
        .from("sections")
        .update({ join_code: randomCode() })
        .eq("id", id)
        .select("id, name, join_code, created_at, starts_at, expires_at")
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

  // Helpers for modal: convert ISO string to datetime-local input value and back
  const isoToInput = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const inputToIso = (input: string) => {
    if (!input) return null;
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  const openRegenModal = async (id: string) => {
    setMsg(null);
    setErr(null);
    setRegenModalOpenFor(id);
    setRegenLoading(true);
    try {
      const { data, error } = await supabase
        .from("sections")
        .select("join_code, starts_at, expires_at")
        .eq("id", id)
        .single();
      if (error) throw error;
      setModalJoinCode((data as any)?.join_code ?? randomCode());
      setModalStartsAtInput(isoToInput((data as any)?.starts_at));
      setModalExpiresAtInput(isoToInput((data as any)?.expires_at));
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load section data.");
      // close modal on failure
      setRegenModalOpenFor(null);
    } finally {
      setRegenLoading(false);
    }
  };

  const closeRegenModal = () => {
    setRegenModalOpenFor(null);
    setModalJoinCode("");
    setModalStartsAtInput("");
    setModalExpiresAtInput("");
  };

  const generateModalCode = () => setModalJoinCode(randomCode());

  const saveRegenChanges = async () => {
    const id = regenModalOpenFor;
    if (!id) return;
    setRegenLoading(true);
    setErr(null);
    setMsg(null);
    // requires expiration
    if (!modalExpiresAtInput) {
      setErr("Please enter an expiration date and time.");
      setRegenLoading(false);
      return;
    }
    const startsIso = inputToIso(modalStartsAtInput) ?? new Date().toISOString();
    const expiresIso = inputToIso(modalExpiresAtInput);
    if (!expiresIso) {
      setErr("Invalid expiration date/time.");
      setRegenLoading(false);
      return;
    }
    if (new Date(expiresIso).getTime() <= new Date(startsIso).getTime()) {
      setErr("Expiration must be after the start time.");
      setRegenLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("sections")
        .update({ join_code: modalJoinCode, starts_at: startsIso, expires_at: expiresIso })
        .eq("id", id)
        .select("id, name, join_code, created_at, starts_at, expires_at")
        .single();
      if (error) throw error;
      setSections((prev) => prev.map((s) => (s.id === id ? (data as SectionRow) : s)));
      setMsg("Section updated.");
      closeRegenModal();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to update section.");
    } finally {
      setRegenLoading(false);
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
    <div className="rounded-3xl p-5 sm:p-6 shadow-xl border mt-8" style={{ background: "#fff", borderColor: `${color.mist}55` }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: color.deep }}>Manage Sections & Join Codes</h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: color.steel }}>
            Create a section, share its <strong>6-character code</strong>, or regenerate a new one anytime.
          </p>
        </div>

        <div className="flex w-full sm:w-auto gap-2 items-center">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New section name"
            className="flex-1 sm:w-64 rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: color.mist, background: "#fff", color: color.deep }}
          />
          <input
            type="datetime-local"
            value={startsAtInput}
            onChange={(e) => setStartsAtInput(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: color.mist, background: "#fff", color: color.deep }}
            title="Section available from"
            placeholder="Available from (optional)"
            aria-label="Section available from"
          />
          <input
            type="datetime-local"
            value={expiresAtInput}
            onChange={(e) => setExpiresAtInput(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: color.mist, background: "#fff", color: color.deep }}
            title="Section expires at"
            placeholder="Expires at (required)"
            aria-label="Section expires at"
          />
          <button
            onClick={createSection}
            disabled={loading || !name.trim() || !expiresAtInput}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition disabled:opacity-60"
            style={{ background: color.teal, color: "#fff" }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Plus className="h-4 w-4 mr-2" />Create</>)}
          </button>
        </div>
      </div>
      {/* Delete confirmation modal */}
      {deleteModalOpenFor && sectionToDelete && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => {
            setDeleteModalOpenFor(null);
            setSectionToDelete(null);
          }} />
          <div className="relative w-[400px] rounded-2xl shadow-2xl bg-white flex flex-col" style={{ border: `1px solid ${color.mist}` }}>
            <div className="p-4 border-b" style={{ borderColor: color.mist }}>
              <h3 className="font-bold" style={{ color: color.deep }}>Confirm Delete Section</h3>
            </div>
            <div className="p-4">
              <p className="text-sm" style={{ color: color.steel }}>
                Are you sure you want to delete the section <strong style={{ color: color.deep }}>{sectionToDelete.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="border-t p-4" style={{ borderColor: color.mist }}>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => {
                    setDeleteModalOpenFor(null);
                    setSectionToDelete(null);
                  }} 
                  className="rounded-xl px-4 py-2 border" 
                  style={{ background: "#fff", color: color.deep, borderColor: color.mist }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (deleteModalOpenFor) {
                      removeSection(deleteModalOpenFor);
                      setDeleteModalOpenFor(null);
                      setSectionToDelete(null);
                    }
                  }} 
                  className="rounded-xl px-4 py-2" 
                  style={{ background: "#dc2626", color: "#fff" }}
                >
                  Delete Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate modal */}
      {regenModalOpenFor && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeRegenModal} />
          <div className="relative w-[480px] rounded-2xl shadow-2xl bg-white flex flex-col" style={{ border: `1px solid ${color.mist}` }}>
            <div className="p-4 border-b" style={{ borderColor: color.mist }}>
              <h3 className="font-bold" style={{ color: color.deep }}>Regenerate Join Code / Edit Availability</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: color.steel }}>Join Code</label>
                <div className="flex gap-2">
                  <input value={modalJoinCode} onChange={(e) => setModalJoinCode(e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: color.mist }} placeholder="6-character code" aria-label="Join code" />
                  <button onClick={generateModalCode} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: color.mist, background: "#fff" }}>New</button>
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: color.steel }}>Available from</label>
                <input type="datetime-local" value={modalStartsAtInput} onChange={(e) => setModalStartsAtInput(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: color.mist }} placeholder="Available from (optional)" aria-label="Modal start datetime" />
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: color.steel }}>Expires at</label>
                <input type="datetime-local" value={modalExpiresAtInput} onChange={(e) => setModalExpiresAtInput(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: color.mist }} placeholder="Expires at (required)" aria-label="Modal expires datetime" />
                {modalExpiresAtInput && new Date(modalExpiresAtInput) <= new Date() && (
                  <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>Warning: This expiration date has already passed</p>
                )}
              </div>
            </div>

            <div className="border-t p-4" style={{ borderColor: color.mist }}>
              <div className="flex justify-end gap-2">
                <button onClick={closeRegenModal} className="rounded-xl px-4 py-2 border" style={{ background: "#fff", color: color.deep, borderColor: color.mist }}>Cancel</button>
                <button onClick={saveRegenChanges} className="rounded-xl px-4 py-2" style={{ background: color.teal, color: "#fff" }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        {(msg || err) && (
          <div className="text-sm">
            {msg && <span style={{ color: "#065f46" }}>{msg}</span>}
            {err && <span style={{ color: "#b91c1c" }}>{err}</span>}
          </div>
        )}
      </div>

      <div className="mt-5 overflow-x-auto">
        {loading && sections.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: color.steel }}>Loading sections…</div>
        ) : sections.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: color.steel }}>No sections yet. Create your first one above.</div>
        ) : (
          <table className="min-w-[800px] w-full divide-y" style={{ borderColor: color.mist }}>
            <thead style={{ background: `${color.mist}11` }}>
              <tr>
                {["Name", "Join Code", "Available", "Expires", "Actions"].map((h) => (
                  <th key={h} className="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: color.steel }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y" style={{ borderColor: color.mist }}>
              {sections.map((s) => {
                const { color: expColor } = getExpirationStatus(s.expires_at);
                return (
                  <tr key={s.id} className="hover:bg-gray-50/60">
                    <td className="px-4 sm:px-6 py-3 text-sm" style={{ color: color.deep }}>{s.name}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm font-mono" style={{ color: color.deep }}>{s.join_code ?? "—"}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm" style={{ color: color.steel }}>{formatDateTime(s.starts_at)}</td>
                    {/* Created column removed as requested */}
                    <td className="px-4 sm:px-6 py-3 text-sm font-medium" style={{ color: expColor }} title={s.expires_at ?? ""}>
                      {s.expires_at ? formatDateTime(s.expires_at) : "No expiration"}
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
                          onClick={() => openRegenModal(s.id)}
                          disabled={busyId === s.id}
                          className="rounded-lg border px-3 py-2 text-xs sm:text-sm disabled:opacity-60"
                          style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
                        >
                          {busyId === s.id ? <Loader2 className="h-4 w-4 inline animate-spin" /> : <RefreshCcw className="h-4 w-4 inline mr-1" />} Regenerate
                        </button>
                        <button
                          onClick={() => {
                            setDeleteModalOpenFor(s.id);
                            setSectionToDelete(s);
                          }}
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
function ManageSections() {
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16">
          {/* Hero + Manage Sections */}
          <ManageSectionsCard />
        </div>
      </header>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default ManageSections;
