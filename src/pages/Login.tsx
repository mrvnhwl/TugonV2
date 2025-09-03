import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, GraduationCap, UserPlus, LogIn, ArrowLeft, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();

  // Unified palette (from the image)
  const c = {
    deep: "#031716",
    ocean: "#032F30",
    teal: "#0A7075",   // used on selection page as primary
    aqua: "#0C969C",   // use as primary here to differentiate
    mist: "#6BA3BE",
    steel: "#274D60",
  };

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
    setError("");
    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
      localStorage.setItem("userType", "teacher");
      navigate("/teacherHome");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{
        // Darker than the selection page for instant differentiation
        background: `linear-gradient(180deg, ${c.teal} 0%, ${c.ocean} 65%, ${c.deep} 100%)`,
      }}
    >
      {/* soft blobs (subtle, in-brand) */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-20"
        style={{ background: c.aqua }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-15"
        style={{ background: c.mist }}
      />

      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="rounded-[32px] shadow-2xl p-1"
            style={{
              // cool edge stroke using mist→aqua
              background: `linear-gradient(135deg, ${c.mist}, ${c.aqua})`,
            }}
          >
            <div
              className="rounded-[30px] p-8 md:p-12 space-y-8"
              style={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/userTypeSelection")}
                  className="inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: c.steel }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <span
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: `${c.mist}33`, color: c.steel }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Teacher Portal
                </span>
              </div>

              <div className="text-center space-y-1">
                <div
                  className="inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold"
                  style={{ background: `${c.mist}44`, color: c.steel }}
                >
                  Welcome to Tugon
                </div>
                <h1
                  className="text-4xl md:text-5xl font-extrabold tracking-tight"
                  style={{ color: c.deep }}
                >
                  Teach confidently
                </h1>
                <p className="mt-2 text-base" style={{ color: c.steel }}>
                  Sign in or create a teacher account.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Student redirect */}
                <button
                  onClick={goStudent}
                  className="group relative overflow-hidden rounded-2xl px-7 py-8 text-left transition-all shadow-lg focus:outline-none"
                  style={{
                    background: "#ffffff",
                    color: c.steel,
                    boxShadow: `0 18px 40px -18px ${c.deep}33`,
                    border: `1px solid ${c.mist}66`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ rotate: -8 }}
                      animate={{ rotate: 8 }}
                      transition={{ repeat: Infinity, duration: 2.2, repeatType: "reverse" }}
                      className="shrink-0"
                    >
                      <GraduationCap className="h-10 w-10" color={c.teal} />
                    </motion.div>
                    <div className="space-y-1">
                      <div className="text-xl font-semibold">Continue as Student</div>
                      <div className="text-sm opacity-90">
                        Access practice, quizzes, and progress tracking.
                      </div>
                    </div>
                  </div>
                  <span
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                    style={{ background: c.aqua }}
                  />
                </button>

                {/* Teacher auth card */}
                <div
                  className="rounded-2xl p-7 shadow-lg h-full"
                  style={{
                    background: c.steel,           // darker card than selection page
                    color: "#fff",
                    boxShadow: `0 18px 40px -18px ${c.deep}99`,
                  }}
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <motion.div
                      initial={{ rotate: -8 }}
                      animate={{ rotate: 8 }}
                      transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                    >
                      <User className="h-9 w-9" color="#ffffff" />
                    </motion.div>
                    <span className="text-lg font-semibold">Teacher</span>
                  </div>

                  {/* Segmented toggle */}
                  <div
                    className="mb-4 grid grid-cols-2 rounded-xl p-1"
                    style={{ background: `${c.deep}99` }}
                  >
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="rounded-lg py-2 text-sm font-medium transition-all"
                      style={{
                        background: !isSignUp ? c.aqua : "transparent",
                        color: !isSignUp ? "#fff" : "#e6f3f3",
                      }}
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="rounded-lg py-2 text-sm font-medium transition-all"
                      style={{
                        background: isSignUp ? c.aqua : "transparent",
                        color: isSignUp ? "#fff" : "#e6f3f3",
                      }}
                    >
                      Sign up
                    </button>
                  </div>

                  <form onSubmit={handleTeacherSubmit} className="space-y-4">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm rounded-md px-4 py-2 border"
                        style={{
                          background: "#fff8f8",
                          borderColor: "#f4c7c7",
                          color: "#9b1c1c",
                        }}
                      >
                        {error}
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-black/90">
                        Teacher email address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@school.edu"
                        className="w-full rounded-2xl px-4 py-3 outline-none border transition-shadow"
                        style={{
                          background: "#000000ff",
                          borderColor: c.aqua,
                        }}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 4px ${c.aqua}33`)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/90">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isSignUp ? "Create a password" : "Enter your password"}
                        className="w-full rounded-2xl px-4 py-3 outline-none border transition-shadow"
                        style={{
                          background: "#ffffff",
                          borderColor: c.aqua,
                        }}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 4px ${c.aqua}33`)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                        autoComplete="current-password"
                      />
                      <p className="text-[11px] text-white/80">
                        {isSignUp
                          ? "Use 8+ characters for a stronger password."
                          : "Forgot your password? Contact an admin."}
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full rounded-2xl font-semibold shadow-md py-3 transition-colors"
                      style={{
                        // use AQUA as the primary here (vs TEAL on selection page)
                        background: c.aqua,
                        color: "#002427",
                        boxShadow: `0 10px 24px -10px ${c.aqua}AA`,
                      }}
                    >
                      {isSignUp ? (
                        <span className="inline-flex items-center gap-2">
                          <UserPlus className="w-5 h-5" />
                          Create account
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <LogIn className="w-5 h-5" />
                          Sign in
                        </span>
                      )}
                    </motion.button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm underline-offset-4 hover:underline"
                        style={{ color: "#e6f3f3" }}
                      >
                        {isSignUp
                          ? "Already have an account? Sign in"
                          : "Don't have an account? Sign up"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* tiny reassurance footer */}
              <p className="text-center text-xs" style={{ color: `${c.steel}AA` }}>
                By continuing, you agree to follow your school’s guidelines.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default Login;
