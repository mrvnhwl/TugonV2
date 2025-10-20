import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Download, ChevronLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import StudentNavbar from "../components/studentNavbar";
import color from "../styles/color";

type Topic = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  file_url: string | null;
  route_path?: string | null;
  html_url?: string | null;
  created_at: string;
  created_by: string;
  created_by_email?: string | null; // filled via profiles_public view
};

export default function StudentTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sectionId, setSectionId] = useState<string | null>(null);

  async function loadTopics() {
    // 1) get student's section
    const { data: sectionRows, error: sectionErr } = await supabase
      .from("section_students")
      .select("section_id")
      .eq("student_id", (await supabase.auth.getUser()).data.user?.id ?? "");
    if (sectionErr) {
      console.error(sectionErr);
      setTopics([]);
      setSectionId(null);
      return;
    }
    const section_id = sectionRows?.[0]?.section_id ?? null;
    setSectionId(section_id ?? null);
    console.log('Student section_id:', section_id);
    if (!section_id) {
      setTopics([]);
      return;
    }

    // 2) load topics
    const { data, error } = await supabase
      .from("topics")
      .select("id,title,description,slug,file_url,route_path,html_url,created_at,created_by,publish_to")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setTopics([]);
      return;
    }

    // Only show topics where section_id is in publish_to
    const baseRows: Topic[] = (data ?? []).filter((r) => {
      const pub = r.publish_to;
      if (!pub) return false;
      let arr: string[] = [];
      if (Array.isArray(pub)) arr = pub.map(String);
      else if (typeof pub === "string") {
        try {
          const parsed = JSON.parse(pub);
          if (Array.isArray(parsed)) arr = parsed.map(String);
        } catch {
          arr = pub.split(",").map((x) => x.trim()).filter(Boolean);
        }
      }
      // Debug log for publish_to
      console.log('Topic:', r.title, 'publish_to:', arr, 'section_id:', String(section_id));
      return arr.map(String).includes(String(section_id));
    }).map((r) => ({
      ...(r as Topic),
      route_path: (r as Topic).route_path || `/topic/${(r as Topic).slug}`,
    }));

    // 3) join teacher emails from the public view (RLS-friendly)
    const ids = Array.from(new Set(baseRows.map((r) => r.created_by).filter(Boolean)));
    const emailMap = new Map<string, string | null>();

    if (ids.length > 0) {
      const { data: profs, error: profErr } = await supabase
        .from("profiles_public") // <-- use the view
        .select("id,email")
        .in("id", ids);

      if (profErr) {
        console.warn("profiles_public lookup failed:", profErr.message);
      } else {
        for (const p of (profs ?? []) as { id: string; email: string | null }[]) {
          emailMap.set(p.id, p.email ?? null);
        }
      }
    }

    setTopics(baseRows.map((r) => ({ ...r, created_by_email: emailMap.get(r.created_by) ?? null })));
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadTopics();
      setLoading(false);
    })();

    const channel = supabase
      .channel("public:topics")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "topics" },
        async () => {
          await loadTopics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // client-side filter
  const filtered = useMemo(() => {
    if (!sectionId) return [];
    if (!q.trim()) return topics;
    const s = q.toLowerCase();
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        (t.description ?? "").toLowerCase().includes(s) ||
        (t.created_by_email ?? "").toLowerCase().includes(s)
    );
  }, [q, topics, sectionId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)` }}>
      {/* Navbar */}
      <StudentNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: color.deep }}>
              Topics
            </h1>
            <p className="text-sm mt-1" style={{ color: color.steel }}>
              Browse topics published by your teachers. Open the page or download the original file.
            </p>
          </div>

          {/* Back to dashboard */}
          <Link
            to="/studentDashboard"
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, description, or teacher email…"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: color.mist, background: "#fff" }}
          />
        </div>

        {/* List */}
        <motion.div
          className="rounded-2xl p-5 shadow-xl ring-1"
          style={{ background: "#fff", borderColor: `${color.mist}55` }}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {loading ? (
            <div className="text-sm" style={{ color: color.steel }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm" style={{ color: color.steel }}>No topics found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full divide-y" style={{ borderColor: color.mist }}>
                <thead style={{ background: `${color.mist}11` }}>
                  <tr>
                    {["Title", "Description", "Teacher", "Created", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: color.steel }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y" style={{ borderColor: color.mist }}>
                  {filtered.map((t) => (
                    <motion.tr key={t.id} variants={itemVariants} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold" style={{ color: color.deep }}>{t.title}</div>
                        <div className="text-xs" style={{ color: color.steel }}>/topic/{t.slug}</div>
                      </td>
                      <td className="px-4 py-3 align-top text-sm" style={{ color: color.steel }}>
                        {t.description || "—"}
                      </td>
                      <td className="px-4 py-3 align-top text-sm" style={{ color: color.steel }}>
                        {t.created_by_email || "—"}
                      </td>
                      <td className="px-4 py-3 align-top text-sm" style={{ color: color.steel }}>
                        {new Date(t.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Student view route */}
                          <Link
                            to={`/student/topics/${t.slug}`}
                            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                            style={{ borderColor: color.mist, color: color.deep, background: "#fff" }}
                            title="Open topic page"
                          >
                            <FileText className="h-4 w-4" />
                            Open Page
                          </Link>

                          {/* Download original file */}
                          {t.file_url ? (
                            <a
                              href={t.file_url}
                              download
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                              style={{ background: color.teal, color: "#fff" }}
                              title="Download original file"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          ) : (
                            <span className="text-sm" style={{ color: color.steel }}>
                              No file
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
