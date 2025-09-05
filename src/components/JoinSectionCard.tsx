// src/components/JoinSectionCard.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { Loader2, CheckCircle2 } from "lucide-react";
import color from "../styles/color";

export default function JoinSectionCard() {
  const { user } = useAuth();
  const email = user?.email ?? "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [mySectionName, setMySectionName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch current membership (if any)
  useEffect(() => {
    (async () => {
      if (!email) return;
      const { data: existing, error } = await supabase
        .from("section_students")
        .select("section_id, sections(name)")
        .eq("student_email", email)
        .maybeSingle();
      if (!error && existing) {
        setMySectionName((existing as any)?.sections?.name ?? null);
      }
    })();
  }, [email]);

  const join = async () => {
    setMessage(null);
    setError(null);

    if (!email) {
      setError("You need to sign in first.");
      return;
    }

    const codeTrim = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(codeTrim)) {
      setError("Enter a valid 6-character code.");
      return;
    }

    setLoading(true);
    try {
      // 1) Find the section
      const { data: section, error: sErr } = await supabase
        .from("sections")
        .select("id, name, join_code")
        .eq("join_code", codeTrim)
        .maybeSingle();
      if (sErr) throw sErr;
      if (!section) {
        setError("No section found for that code.");
        return;
      }

      // 2) Insert membership (email-only model)
      //    Table has PK(student_email) so it enforces the “one section per student” rule.
      const { error: iErr } = await supabase
        .from("section_students")
        .insert({ section_id: section.id, student_email: email });
      if (iErr) {
        // If policy forbids a second join or PK exists, show a friendly message
        if ((iErr as any)?.code === "23505") {
          setError("You’re already in a section.");
        } else {
          setError(iErr.message ?? "Could not join section.");
        }
        return;
      }

      setMySectionName(section.name);
      setMessage(`Joined section: ${section.name}`);
      setCode("");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-4 sm:p-5 shadow-md ring-1"
      style={{ background: "#fff", borderColor: `${color.mist}55` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold" style={{ color: color.deep }}>
            {mySectionName ? "Your Section" : "Join your class section"}
          </h3>
          <p className="text-xs sm:text-sm mt-1" style={{ color: color.steel }}>
            {mySectionName
              ? <>You’re in <span className="font-medium" style={{ color: color.deep }}>{mySectionName}</span>.</>
              : "Ask your teacher for a 6-character code and enter it here."}
          </p>
        </div>

        {!mySectionName && (
          <div className="flex w-full sm:w-auto gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="ABC123"
              className="flex-1 sm:w-40 rounded-lg border px-3 py-2 text-sm tracking-widest text-center"
              style={{ borderColor: color.mist, background: "#fff", color: color.deep, letterSpacing: "0.15em" }}
            />
            <button
              onClick={join}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition disabled:opacity-60"
              style={{ background: color.teal, color: "#fff" }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
            </button>
          </div>
        )}
      </div>

      {(message || error) && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          {message && (
            <>
              <CheckCircle2 className="h-4 w-4" style={{ color: "#059669" }} />
              <span style={{ color: "#065f46" }}>{message}</span>
            </>
          )}
          {error && <span style={{ color: "#b91c1c" }}>{error}</span>}
        </div>
      )}
    </div>
  );
}
