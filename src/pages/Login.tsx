import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, GraduationCap, UserPlus, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  // Same palette + CSS vars as UserTypeSelection
  const cssVars = useMemo(
    () => ({
      ["--deep" as any]: "#031716",
      ["--ocean" as any]: "#032F30",
      ["--teal" as any]: "#0A7075",
      ["--aqua" as any]: "#0C969C",
      ["--mist" as any]: "#6BA3BE",
      ["--steel" as any]: "#274D60",
    }),
    []
  );

  useEffect(() => {
    document.body.classList.add("hide-navbar");
    return () => document.body.classList.remove("hide-navbar");
  }, []);

  const goStudent = () => {
    localStorage.setItem("userType", "student");
    navigate("/userTypeSelection");
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      // Auth
      if (isSignUp) {
        await signUp(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }

      // Enforce teacher-only: check profiles.role
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", email.trim())
        .maybeSingle();

      if (profErr) throw profErr;
      if (!prof || prof.role !== "teacher") {
        setError("Only teacher accounts can sign in here.");
        // Optional: sign out to clear the session
        try { await supabase.auth.signOut(); } catch {}
        return;
      }

      localStorage.setItem("userType", "teacher");
      navigate("/teacherHome");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={cssVars as React.CSSProperties}
      className="min-h-screen flex items-center justify-center px-4"
    >
      {/* Same background as UserTypeSelection */}
      <div
        aria-hidden
        className="fixed inset-0"
        style={{ background: "linear-gradient(180deg, var(--steel), var(--ocean))" }}
      />

      <div
        className="relative w-full max-w-2xl rounded-3xl p-8 md:p-10 bg-white/95 backdrop-blur"
        style={{ border: "1px solid color-mix(in oklab, var(--mist), transparent 60%)" }}
      >
        {/* Same header block */}
        <header className="text-center mb-8">
          <span
            className="inline-block text-xs px-3 py-1 rounded-full"
            style={{
              background: "color-mix(in oklab, var(--mist), white 80%)",
              color: "var(--steel)",
            }}
          >
            Welcome to Tugon
          </span>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold" style={{ color: "var(--deep)" }}>
            Learn comfortably
          </h1>
          <p className="mt-1" style={{ color: "var(--steel)" }}>
            Sign in or create your teacher account.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT: Teacher sign in / sign up (styled just like the student card) */}
          <section
            aria-label="Teacher sign in or sign up"
            className="rounded-2xl p-6"
            style={{
              background: "color-mix(in oklab, var(--mist), white 88%)",
              border: "1px solid color-mix(in oklab, var(--mist), transparent 50%)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <User className="h-6 w-6" color="#0A7075" aria-hidden />
              <span className="font-semibold" style={{ color: "var(--deep)" }}>
                Teacher
              </span>
            </div>

            {/* Toggle (same look) */}
            <div
              className="grid grid-cols-2 rounded-xl p-1 mb-4 border"
              style={{
                borderColor: "color-mix(in oklab, var(--mist), transparent 50%)",
                background: "#fff",
              }}
              role="tablist"
              aria-label="Auth mode"
            >
              <button
                role="tab"
                aria-selected={!isSignUp}
                type="button"
                onClick={() => setIsSignUp(false)}
                className="rounded-lg py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2"
                style={{
                  background: !isSignUp ? "var(--aqua)" : "transparent",
                  color: !isSignUp ? "#fff" : "var(--steel)",
                }}
              >
                Sign in
              </button>
              <button
                role="tab"
                aria-selected={isSignUp}
                type="button"
                onClick={() => setIsSignUp(true)}
                className="rounded-lg py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2"
                style={{
                  background: isSignUp ? "var(--aqua)" : "transparent",
                  color: isSignUp ? "#fff" : "var(--steel)",
                }}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={handleTeacherSubmit} className="space-y-4" noValidate>
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="text-sm rounded-md px-4 py-2 border"
                  style={{
                    background: "#fff8f8",
                    borderColor: "#f4c7c7",
                    color: "#9b1c1c",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: "var(--steel)" }}>
                  Teacher email address
                </label>
                <input
                  type="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu"
                  className="w-full rounded-xl px-4 py-3 outline-none border focus-visible:ring-2"
                  style={{
                    borderColor: "var(--aqua)",
                    background: "#fff",
                    ringColor: "color-mix(in oklab, var(--aqua), transparent 70%)",
                    color: "var(--deep)",
                  } as React.CSSProperties}
                  autoComplete={isSignUp ? "email" : "username"}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: "var(--steel)" }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  className="w-full rounded-xl px-4 py-3 outline-none border focus-visible:ring-2"
                  style={{
                    borderColor: "var(--aqua)",
                    background: "#fff",
                    ringColor: "color-mix(in oklab, var(--aqua), transparent 70%)",
                    color: "var(--deep)",
                  } as React.CSSProperties}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  minLength={isSignUp ? 8 : undefined}
                />
                <p className="text-[11px]" style={{ color: "color-mix(in oklab, var(--steel), transparent 20%)" }}>
                  {isSignUp ? "Use 8+ characters." : "Forgot password? Contact an admin."}
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl font-semibold py-3 transition-opacity focus-visible:outline-none focus-visible:ring-2 hover:opacity-95 disabled:opacity-60"
                style={{ background: "var(--teal)", color: "#fff" }}
              >
                {submitting ? (
                  "Please wait..."
                ) : isSignUp ? (
                  <span className="inline-flex items-center gap-2">
                    <UserPlus className="w-5 h-5" aria-hidden />
                    Create account
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <LogIn className="w-5 h-5" aria-hidden />
                    Sign in
                  </span>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp((v) => !v)}
                  className="text-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2"
                  style={{ color: "var(--steel)" }}
                >
                  {isSignUp ? "Already have an account? Sign in" : "No account? Sign up"}
                </button>
              </div>
            </form>
          </section>

          {/* RIGHT: Continue as Student — same card vibe as on the selector */}
          <button
            onClick={goStudent}
            className="rounded-2xl px-6 py-6 text-left transition-transform hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2"
            style={{
              background: "var(--ocean)",
              color: "#fff",
              ringColor: "var(--aqua)",
            } as React.CSSProperties}
          >
            <div className="flex items-start gap-3">
              <GraduationCap className="h-8 w-8" aria-hidden />
              <div>
                <div className="text-lg font-semibold">Continue as Student</div>
                <div className="text-sm/5 opacity-90">
                  Practice, quizzes, and progress tracking.
                </div>
              </div>
            </div>
          </button>
        </div>

        <p
          className="text-center text-xs mt-8"
          style={{ color: "color-mix(in oklab, var(--steel), transparent 33%)" }}
        >
          By continuing, you agree to follow your school’s guidelines.
        </p>
      </div>
    </div>
  );
}

export default Login;
