import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import color from "../styles/color";

type ProgressRow = {
  id: string;
  user_id: string;
  user_email: string | null;
  quiz_id: string;
  score: number | null;
  completed_at: string | null;
  quizzes: { title: string | null } | null;
};

type QuizRef = { id: string; title: string | null };

type StudentGroup = {
  user_id: string;
  user_email: string | null;
  rows: ProgressRow[]; // all attempts (sorted newest → oldest)
  latest: ProgressRow; // rows[0]
};

const PAGE_SIZE_OPTIONS = [15, 30, 50];

function StudentProgress() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // raw rows (filtered server-side by search & quiz)
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [quizzes, setQuizzes] = useState<QuizRef[]>([]);

  // filters & pagination (paginate by STUDENT, not rows)
  const [search, setSearch] = useState("");
  const [quizFilter, setQuizFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // dropdown state (expanded students)
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // derived: group attempts by student (newest→oldest)
  const groups: StudentGroup[] = useMemo(() => {
    const map = new Map<string, StudentGroup>();
    const ts = (d: string | null | undefined) =>
      d ? new Date(d).getTime() : 0;

    // rows already ordered newest→oldest, but we’ll enforce per group too
    for (const r of rows) {
      const key = r.user_id;
      if (!map.has(key)) {
        map.set(key, { user_id: key, user_email: r.user_email, rows: [r], latest: r });
      } else {
        const g = map.get(key)!;
        g.rows.push(r);
      }
    }

    const arr = Array.from(map.values()).map((g) => {
      g.rows.sort((a, b) => ts(b.completed_at) - ts(a.completed_at));
      g.latest = g.rows[0];
      return g;
    });

    // sort students by their latest completion
    arr.sort((a, b) => ts(b.latest.completed_at) - ts(a.latest.completed_at));
    return arr;
  }, [rows]);

  const studentsTotal = groups.length;
  const totalPages = Math.max(1, Math.ceil(studentsTotal / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pageGroups = groups.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    const loadFilters = async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, title")
        .order("title", { ascending: true });
      if (!error) setQuizzes(data ?? []);
    };
    loadFilters();
  }, []);

  // load rows whenever filters change (fetch MANY rows; paginate client-side by student)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      setExpanded(new Set()); // collapse all on new filter

      try {
        let query = supabase
          .from("user_progress")
          .select(
            `
            id,
            user_id,
            user_email,
            quiz_id,
            score,
            completed_at,
            quizzes ( title )
          `
          )
          .order("completed_at", { ascending: false })
          .limit(2000); // generous cap; adjust if needed

        if (quizFilter) query = query.eq("quiz_id", quizFilter);
        if (search.trim()) query = query.ilike("user_email", `%${search.trim()}%`);

        const { data, error } = await query;
        if (error) throw error;
        setRows((data ?? []) as ProgressRow[]);
        setPage(1); // reset to first page on filter change
      } catch (e: any) {
        console.error("Failed to load progress:", e);
        setErrorMsg(e?.message ?? "Failed to load progress.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizFilter, search]);

  const toggleExpand = (user_id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(user_id) ? next.delete(user_id) : next.add(user_id);
      return next;
    });
  };

  const safeDate = (d?: string | null) =>
    d ? new Date(d).toLocaleString?.() || "" : "";

  const exportCSV = () => {
    // export all attempts for the students on the current page
    const exportRows = pageGroups.flatMap((g) => g.rows);
    const header = [
      "student_id",
      "user_email",
      "quiz_id",
      "quiz_title",
      "score",
      "completed_at",
    ];
    const lines = [header.join(",")];

    exportRows.forEach((r) => {
      const vals = [
        r.user_id,
        r.user_email ?? "",
        r.quiz_id,
        r.quizzes?.title ?? "",
        String(r.score ?? ""),
        r.completed_at ?? "",
      ].map((v) => `"${String(v).replaceAll('"', '""')}"`);
      lines.push(vals.join(","));
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_progress_page.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)` }}
    >
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          className="rounded-3xl p-5 sm:p-8 shadow-xl ring-1 mb-6 sm:mb-8"
          style={{ background: "#fff", borderColor: `${color.mist}55` }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold" style={{ color: color.deep }}>
                Student Progress
              </h1>
              <p className="mt-2 text-sm" style={{ color: color.steel }}>
                View each student's latest result, and expand to see all quiz attempts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div
                className="flex items-center gap-2 rounded-xl border px-3 py-2 w-full sm:w-72"
                style={{ borderColor: color.mist, background: "#fff" }}
              >
                <Search className="h-4 w-4" style={{ color: color.steel }} />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  className="w-full outline-none text-sm"
                  placeholder="Search by student email…"
                />
              </div>

              <div
                className="flex items-center gap-2 rounded-xl border px-3 py-2 w-full sm:w-64"
                style={{ borderColor: color.mist, background: "#fff" }}
              >
                <Filter className="h-4 w-4" style={{ color: color.steel }} />
                <select
                  value={quizFilter}
                  onChange={(e) => {
                    setQuizFilter(e.target.value);
                  }}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  <option value="">All quizzes</option>
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title || "(Untitled)"}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={exportCSV}
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold shadow-md transition"
                style={{ background: color.teal, color: "#fff" }}
                title="Export current page to CSV"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="rounded-2xl p-5 sm:p-6 shadow-xl ring-1"
          style={{ background: "#fff", borderColor: `${color.mist}55` }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {loading ? (
            <div className="py-16 text-center">
              <div
                className="inline-block rounded-full h-12 w-12 border-4 border-t-4 animate-spin"
                style={{ borderColor: `${color.teal}40` }}
              />
              <div className="mt-3 text-sm" style={{ color: color.steel }}>
                Loading progress…
              </div>
            </div>
          ) : errorMsg ? (
            <div className="py-10 text-center text-sm" style={{ color: "#b91c1c" }}>
              {errorMsg}
            </div>
          ) : groups.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: color.steel }}>
              No matching progress found.
            </div>
          ) : (
            <>
              {/* Mobile cards (grouped by student) */}
              <div className="md:hidden space-y-3">
                {pageGroups.map((g) => {
                  const latest = g.latest;
                  const hasMore = g.rows.length > 1;
                  const isOpen = expanded.has(g.user_id);
                  return (
                    <div
                      key={g.user_id}
                      className="rounded-xl p-4"
                      style={{ border: `1px solid ${color.mist}`, background: "#fff" }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm" style={{ color: color.deep }}>
                            {g.user_email || g.user_id.slice(0, 8)}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: color.steel }}>
                            {safeDate(latest.completed_at)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold" style={{ color: color.teal }}>
                            {latest.score ?? 0}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm" style={{ color: color.steel }}>
                        Latest quiz:{" "}
                        <span className="font-medium" style={{ color: color.deep }}>
                          {latest.quizzes?.title || "(Untitled)"}
                        </span>
                      </div>

                      {hasMore && (
                        <button
                          onClick={() => toggleExpand(g.user_id)}
                          className="mt-3 inline-flex items-center gap-1 text-sm font-medium"
                          style={{ color: color.teal }}
                        >
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {isOpen ? "Hide history" : `View history (${g.rows.length - 1} more)`}
                        </button>
                      )}

                      {isOpen && (
                        <div className="mt-3 rounded-lg border" style={{ borderColor: color.mist }}>
                          <div className="divide-y" style={{ borderColor: color.mist }}>
                            {g.rows.map((r, idx) => (
                              <div key={r.id} className="p-3 text-sm">
                                <div className="font-medium" style={{ color: color.deep }}>
                                  {r.quizzes?.title || "(Untitled)"} — {r.score ?? 0}%
                                </div>
                                <div className="text-xs" style={{ color: color.steel }}>
                                  {safeDate(r.completed_at)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop table (grouped by student) */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-[820px] w-full divide-y" style={{ borderColor: color.mist }}>
                    <thead style={{ background: `${color.mist}11` }}>
                      <tr>
                        {["Student", "Latest Quiz", "Latest Score", "Completed At", ""].map((h, i) => (
                          <th
                            key={i}
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: color.steel }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y" style={{ borderColor: color.mist }}>
                      {pageGroups.map((g) => {
                        const latest = g.latest;
                        const hasMore = g.rows.length > 1;
                        const isOpen = expanded.has(g.user_id);

                        return (
                          <React.Fragment key={g.user_id}>
                            <tr className="hover:bg-gray-50/60">
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: color.deep }}>
                                {g.user_email || g.user_id.slice(0, 8)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: color.deep }}>
                                {latest.quizzes?.title || "(Untitled)"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: color.deep }}>
                                {latest.score ?? 0}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: color.steel }}>
                                {safeDate(latest.completed_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {hasMore && (
                                  <button
                                    onClick={() => toggleExpand(g.user_id)}
                                    className="inline-flex items-center gap-1 text-sm font-medium"
                                    style={{ color: color.teal }}
                                  >
                                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    {isOpen ? "Hide" : `History (${g.rows.length - 1})`}
                                  </button>
                                )}
                              </td>
                            </tr>

                            {isOpen && (
                              <tr>
                                <td colSpan={5} className="px-6 py-4 bg-gray-50">
                                {/* nested attempts table */}
                                  <div className="rounded-lg border bg-white" style={{ borderColor: color.mist }}>
                                    <table className="min-w-full divide-y" style={{ borderColor: color.mist }}>
                                      <thead style={{ background: `${color.mist}11` }}>
                                        <tr>
                                          {["Quiz", "Score", "Completed At"].map((h) => (
                                            <th
                                              key={h}
                                              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider"
                                              style={{ color: color.steel }}
                                            >
                                              {h}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y" style={{ borderColor: color.mist }}>
                                        {g.rows.map((r) => (
                                          <tr key={r.id} className="hover:bg-gray-50/60">
                                            <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: color.deep }}>
                                              {r.quizzes?.title || "(Untitled)"}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: color.deep }}>
                                              {r.score ?? 0}%
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: color.steel }}>
                                              {safeDate(r.completed_at)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination (by students) */}
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm" style={{ color: color.steel }}>
                  Showing <strong>{pageGroups.length}</strong> of{" "}
                  <strong>{studentsTotal}</strong> students
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPage(1);
                      setPageSize(parseInt(e.target.value, 10));
                    }}
                    className="rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: color.mist, background: "#fff", color: color.deep }}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n} / page
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="rounded-lg border px-3 py-2 disabled:opacity-40"
                      style={{ borderColor: color.mist, background: "#fff" }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm" style={{ color: color.steel }}>
                      Page {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="rounded-lg border px-3 py-2 disabled:opacity-40"
                      style={{ borderColor: color.mist, background: "#fff" }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default StudentProgress;
