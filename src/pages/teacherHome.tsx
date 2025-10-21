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
  { title: "Run Quiz Sessions", description: "Host quizzes with countdowns, locks, and instant feedback.", icon: Play, animation: quizAnimation, link: "/teacherHome" },
  { title: "Progress & Insights", description: "See class trends, item analysis, and exportable grade reports in seconds.", icon: BarChart, animation: progressAnimation, link: "/student-progress" },
  { title: "Boost Engagement", description: "Leaderboards and teams that motivate—without sacrificing learning goals.", icon: Users, animation: competeAnimation, link: "/teacherDashboard" },
];

// ✅ Only include links that exist in App routes
const quickLinks: { label: string; to: string }[] = [
  { label: "Create a Quiz", to: "/create-quiz" },
  { label: "Manage Quizzes", to: "/teacherDashboard" },
  { label: "Class Reports", to: "/student-progress" },
  { label: "Student Progress", to: "/student-progress" },
  { label: "Manage Sections", to: "/manage-sections" },
];

const lottieOptions = (animationData: LottieAny) => ({
  loop: true, autoplay: true, animationData,
  rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
});

function ManageSectionsCard() {
  return (
    <header className="w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
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
              </div>
            </motion.div>
          </div>
        </div>
      </header>
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

      <div className="mt-auto pb-8">
        <Footer />
      </div>
    </div>
  );
}

export default TeacherHome;
