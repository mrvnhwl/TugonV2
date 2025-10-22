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
  source?: 'teacher' | 'ai-generated'; // to distinguish between regular topics and published_topics
};

export default function StudentTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [publishedTopics, setPublishedTopics] = useState<Topic[]>([]);
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

    // 2) Load regular topics (teacher-created)
    const { data: regularData, error: regularError } = await supabase
      .from("topics")
      .select("id,title,description,slug,file_url,route_path,html_url,created_at,created_by,publish_to")
      .order("created_at", { ascending: false });

    if (regularError) {
      console.error("Error loading regular topics:", regularError);
    }

    // Only show regular topics where section_id is in publish_to
    const regularTopics: Topic[] = (regularData ?? []).filter((r) => {
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
      console.log('Regular Topic:', r.title, 'publish_to:', arr, 'section_id:', String(section_id));
      return arr.map(String).includes(String(section_id));
    }).map((r) => ({
      ...(r as Topic),
      route_path: (r as Topic).route_path || `/topic/${(r as Topic).slug}`,
      source: 'teacher' as const,
    }));

    // 3) Load published topics (AI-generated with section filtering)
    const { data: publishedData, error: publishedError } = await supabase
      .from("published_topics")
      .select("id,title,about_refined,created_at,creator_full_name,published_at,publish_to_sections,is_active,status,view_count")
      .eq("is_active", true)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (publishedError) {
      console.error("Error loading published topics:", publishedError);
    }

    // Filter published topics by section (with backward compatibility for NULL)
    const aiGeneratedTopics: Topic[] = (publishedData ?? []).filter((r) => {
      const sections = r.publish_to_sections;
      // Backward compatibility: if publish_to_sections is NULL, show to all students
      if (!sections || sections.length === 0) {
        console.log('Published Topic (all sections):', r.title);
        return true;
      }
      // Check if student's section is in the array
      const hasAccess = sections.includes(String(section_id));
      console.log('Published Topic:', r.title, 'publish_to_sections:', sections, 'hasAccess:', hasAccess);
      return hasAccess;
    }).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.about_refined || null,
      slug: r.id, // Use ID as slug since published_topics table doesn't have slug field
      file_url: null, // published topics don't have file_url
      route_path: `/topic-presenter/${r.id}`,
      html_url: null,
      created_at: r.published_at || r.created_at,
      created_by: '', // AI-generated, no specific teacher ID
      created_by_email: r.creator_full_name || 'AI Generated',
      source: 'ai-generated' as const,
    }));

    // 4) Keep topics separate (no merge)
    const baseRows: Topic[] = regularTopics;

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
    setPublishedTopics(aiGeneratedTopics);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadTopics();
      setLoading(false);
    })();

    // Subscribe to changes in both tables
    const topicsChannel = supabase
      .channel("public:topics")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "topics" },
        async () => {
          await loadTopics();
        }
      )
      .subscribe();

    const publishedChannel = supabase
      .channel("public:published_topics")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "published_topics" },
        async () => {
          await loadTopics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(topicsChannel);
      supabase.removeChannel(publishedChannel);
    };
  }, []);

  // client-side filter for regular topics
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

  // client-side filter for AI-generated topics
  const filteredPublished = useMemo(() => {
    if (!sectionId) return [];
    if (!q.trim()) return publishedTopics;
    const s = q.toLowerCase();
    return publishedTopics.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        (t.description ?? "").toLowerCase().includes(s)
    );
  }, [q, publishedTopics, sectionId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 },
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

        {loading ? (
          <div className="text-center py-10">
            <div className="text-sm" style={{ color: color.steel }}>Loading topics…</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Teacher-Created Topics Table */}
            <motion.div
              className="rounded-2xl p-5 shadow-xl ring-1 flex flex-col"
              style={{ background: "#fff", borderColor: `${color.mist}55`, height: "600px" }}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <div className="mb-4 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-bold" style={{ color: color.deep }}>
                  Teacher-Created Topics
                </h2>
                <span 
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: `${color.teal}15`, color: color.teal }}
                >
                  {filtered.length} {filtered.length === 1 ? 'topic' : 'topics'}
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="text-sm text-center py-8 flex-1 flex items-center justify-center" style={{ color: color.steel }}>
                  No teacher-created topics found.
                </div>
              ) : (
                <div className="overflow-y-auto flex-1" style={{ maxHeight: "calc(600px - 80px)" }}>
                  <table className="w-full divide-y" style={{ borderColor: color.mist }}>
                    <thead style={{ background: `${color.mist}11`, position: "sticky", top: 0, zIndex: 10 }}>
                      <tr>
                        {["Title", "Teacher", "Actions"].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: color.steel }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y" style={{ borderColor: color.mist }}>
                      {filtered.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50/60">
                          <td className="px-3 py-3 align-top">
                            <motion.div variants={itemVariants}>
                              <div className="font-semibold text-sm" style={{ color: color.deep }}>{t.title}</div>
                              <div className="text-xs mt-1 line-clamp-2" style={{ color: color.steel }}>
                                {t.description || "No description"}
                              </div>
                            </motion.div>
                          </td>
                          <td className="px-3 py-3 align-top text-xs" style={{ color: color.steel }}>
                            <motion.div variants={itemVariants}>
                              {t.created_by_email || "—"}
                            </motion.div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <motion.div variants={itemVariants} className="flex flex-col gap-2">
                              <Link
                                to={`/student/topics/${t.slug}`}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs whitespace-nowrap"
                                style={{ borderColor: color.mist, color: color.deep, background: "#fff" }}
                                title="Open topic page"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Open Page
                              </Link>

                              {t.file_url && (
                                <a
                                  href={t.file_url}
                                  download
                                  className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs whitespace-nowrap"
                                  style={{ background: color.teal, color: "#fff" }}
                                  title="Download original file"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Download
                                </a>
                              )}
                            </motion.div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* AI-Generated Topics Table */}
            <motion.div
              className="rounded-2xl p-5 shadow-xl ring-1 flex flex-col"
              style={{ background: "#fff", borderColor: `${color.ocean}55`, height: "600px" }}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <div className="mb-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold" style={{ color: color.deep }}>
                    AI-Generated Topics
                  </h2>
                  <span 
                    className="text-xs px-2 py-1 rounded-md font-medium"
                    style={{ background: `${color.ocean}20`, color: color.ocean }}
                    title="Topics generated by AI from student submissions"
                  >
                    AI
                  </span>
                </div>
                <span 
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: `${color.ocean}15`, color: color.ocean }}
                >
                  {filteredPublished.length} {filteredPublished.length === 1 ? 'topic' : 'topics'}
                </span>
              </div>

              {filteredPublished.length === 0 ? (
                <div className="text-sm text-center py-8 flex-1 flex items-center justify-center" style={{ color: color.steel }}>
                  No AI-generated topics found.
                </div>
              ) : (
                <div className="overflow-y-auto flex-1" style={{ maxHeight: "calc(600px - 80px)" }}>
                  <table className="w-full divide-y" style={{ borderColor: color.mist }}>
                    <thead style={{ background: `${color.ocean}11`, position: "sticky", top: 0, zIndex: 10 }}>
                      <tr>
                        {["Title", "Created By", "Actions"].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: color.steel }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y" style={{ borderColor: color.mist }}>
                      {filteredPublished.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50/60">
                          <td className="px-3 py-3 align-top">
                            <motion.div variants={itemVariants}>
                              <div className="font-semibold text-sm" style={{ color: color.deep }}>{t.title}</div>
                              <div className="text-xs mt-1 line-clamp-2" style={{ color: color.steel }}>
                                {t.description || "No description"}
                              </div>
                            </motion.div>
                          </td>
                          <td className="px-3 py-3 align-top text-xs" style={{ color: color.steel }}>
                            <motion.div variants={itemVariants}>
                              {t.created_by_email || "AI Generated"}
                            </motion.div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <motion.div variants={itemVariants} className="flex flex-col gap-2">
                              <Link
                                to={`/topic-presenter/${t.id}`}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs whitespace-nowrap"
                                style={{ borderColor: color.mist, color: color.deep, background: "#fff" }}
                                title="View AI-generated topic"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Open Page
                              </Link>
                            </motion.div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
