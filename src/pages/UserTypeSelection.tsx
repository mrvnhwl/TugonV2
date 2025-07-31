import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, GraduationCap, Lock, UserPlus, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

function UserTypeSelection() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();

  useEffect(() => {
    document.body.classList.add("hide-navbar");
    return () => {
      document.body.classList.remove("hide-navbar");
    };
  }, []);

  const handleUserTypeSelection = (userType: string) => {
    localStorage.setItem("userType", userType);
    if (userType === "student") {
      navigate("/studentDashboard");
    } else if (userType === "teacher") {
      navigate("/login"); // Go to the login page for teacher
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      handleUserTypeSelection("student");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tugon</h1>
          <p className="text-gray-600 mb-6">Please select to continue.</p>

          <div className="flex flex-col gap-6">
            {/* Teacher Option */}
            <button
              onClick={() => handleUserTypeSelection("teacher")}
              className="flex flex-col items-center justify-center space-y-2 px-6 py-6 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <motion.div
                initial={{ rotate: -15 }}
                animate={{ rotate: 15 }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  repeatType: "reverse",
                }}
                className="flex justify-center mb-1"
              >
                <User className="h-10 w-10" />
              </motion.div>
              <span className="text-lg font-semibold">Login as Teacher</span>
            </button>

            {/* Student Option - Modern Login/Signup */}
            <div className="flex flex-col items-center justify-center px-6 py-6 bg-green-100 rounded-xl shadow-md w-full">
              <motion.div
                initial={{ rotate: -15 }}
                animate={{ rotate: 15 }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  repeatType: "reverse",
                }}
                className="flex justify-center mb-2"
              >
                <GraduationCap className="h-10 w-10 text-green-700" />
              </motion.div>
              <span className="text-lg font-semibold mb-2">Student</span>
              <form onSubmit={handleStudentSubmit} className="w-full space-y-3">
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded text-sm mb-2"
                  >
                    {error}
                  </motion.div>
                )}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-400"
                  autoComplete="email"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-400"
                  autoComplete="current-password"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 text-white bg-green-600 rounded-md shadow-md hover:bg-green-700"
                >
                  {isSignUp ? (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Sign up
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign in
                    </>
                  )}
                </motion.button>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-green-700 hover:text-green-600 text-sm"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp
                      ? "Already have an account? Sign in"
                      : "Don't have an account? Sign up"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default UserTypeSelection;