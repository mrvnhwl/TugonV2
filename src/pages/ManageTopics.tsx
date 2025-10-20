// src/pages/ManageTopics.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UploadCloud,
  PencilLine,
  Trash2,
  FileText,
  ChevronLeft,
  Save,
  X,
  Shield,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import color from "../styles/color";

type Topic = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  file_url: string | null;
  file_path: string | null;
  route_path?: string | null;
  is_builtin?: boolean | null;
  html_url?: string | null;
  // status can exist in DB but isn't used in UI now
  status?: "pending" | "ready" | "error" | null;
  status_message?: string | null;
  created_at: string;
  created_by: string;
  // derived at load-time
  created_by_email?: string | null;
};

const TOPICS_BUCKET = import.meta.env.VITE_SUPABASE_TOPICS_BUCKET || "topics";
const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convert-topic`;
const EDGE_AUTH = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ManageTopics() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [bucketOk, setBucketOk] = useState<boolean | null>(null);
  const [bucketMsg, setBucketMsg] = useState<string>("");

  // Create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  // Edit modal
  const [editing, setEditing] = useState<Topic | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const email = user?.email ?? "";
  const username = useMemo(
    () => (email.includes("@") ? email.split("@")[0] : email || "Teacher"),
    [email]
  );

  async function checkBucket() {
    try {
      const { error } = await supabase.storage.from(TOPICS_BUCKET).list("", { limit: 1, offset: 0 });
      if (error) {
        setBucketOk(false);
        setBucketMsg(
          `Storage bucket "${TOPICS_BUCKET}" not found. Create it in Supabase → Storage and make it public, or set VITE_SUPABASE_TOPICS_BUCKET to an existing bucket.`
        );
      } else {
        setBucketOk(true);
        setBucketMsg("");
      }
    } catch (e: any) {
      setBucketOk(false);
      setBucketMsg(`Could not access storage bucket "${TOPICS_BUCKET}". ${e?.message ?? ""}`.trim());
    }
  }

  async function loadTopics() {
    // 1) load topics
    const { data, error } = await supabase
      .from("topics")
      .select(
        "id,title,description,slug,file_url,file_path,route_path,html_url,is_builtin,status,status_message,created_at,created_by"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setTopics([]);
      return;
    }

    const baseRows: Topic[] = (data ?? []).map((r) => ({
      ...(r as Topic),
      route_path: (r as Topic).route_path || `/topic/${(r as Topic).slug}`,
    }));

    // 2) fetch creator emails in one query (robust even if FK/relation isn't set up)
    const ids = Array.from(new Set(baseRows.map((r) => r.created_by).filter(Boolean)));
    let emailMap = new Map<string, string | null>();
    if (ids.length > 0) {
      const { data: profs, error: profErr } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", ids);

      if (!profErr && profs) {
        for (const p of profs as { id: string; email: string | null }[]) {
          emailMap.set(p.id, p.email ?? null);
        }
      } else if (profErr) {
        console.warn("profiles lookup failed:", profErr.message);
      }
    }

    const enriched = baseRows.map((r) => ({
      ...r,
      created_by_email: emailMap.get(r.created_by) ?? null,
    }));
    setTopics(enriched);
  }

  async function callConvertEdge(t: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    file_url: string | null;
  }) {
    if (!t.file_url) return;
    try {
      await fetch(EDGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: EDGE_AUTH,
        },
        body: JSON.stringify({
          topic_id: t.id,
          title: t.title,
          description: t.description,
          slug: t.slug,
          file_url: t.file_url,
        }),
      });
    } catch (e) {
      console.error("convert-topic failed:", e);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await checkBucket();
      await loadTopics();
      setLoading(false);
    })();

    // realtime: keep table in sync if any changes occur
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) {
      alert("You must be signed in.");
      return;
    }
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }
    if (!file) {
      alert("Please attach a file.");
      return;
    }
    if (bucketOk === false) {
      alert(bucketMsg || `Bucket "${TOPICS_BUCKET}" not found.`);
      return;
    }

    setCreating(true);
    const baseSlug = slugify(title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    try {
      // 1) upload
      const sanitizedName = file.name.replace(/[^\w.\-]/g, "_");
      const path = `${user.id}/${uniqueSlug}/${sanitizedName}`;
      const { error: upErr } = await supabase.storage
        .from(TOPICS_BUCKET)
        .upload(path, file, { upsert: false, cacheControl: "3600" });
      if (upErr) throw upErr;

      // 2) public URL
      const { data: pub } = supabase.storage.from(TOPICS_BUCKET).getPublicUrl(path);
      const fileUrl = pub?.publicUrl ?? null;

      // 3) insert topic row
      const { data: inserted, error: insErr } = await supabase
        .from("topics")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          slug: uniqueSlug,
          file_url: fileUrl,
          file_path: path,
          created_by: user.id,
          route_path: `/topic/${uniqueSlug}`,
        })
        .select("*")
        .single();
      if (insErr) throw insErr;

      // 4) trigger conversion (optional pre-render)
      await callConvertEdge({
        id: inserted.id,
        title: inserted.title,
        description: inserted.description,
        slug: inserted.slug,
        file_url: inserted.file_url,
      });

      setTitle("");
      setDescription("");
      setFile(null);
      await loadTopics();
      alert("Topic created.");
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Failed to create topic.");
    } finally {
      setCreating(false);
    }
  }

  function openEdit(t: Topic) {
    setEditing(t);
    setEditTitle(t.title);
    setEditDescription(t.description ?? "");
    setEditFile(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!user?.id) {
      alert("You must be signed in.");
      return;
    }
    if (!editTitle.trim()) {
      alert("Please enter a title.");
      return;
    }

    const isBuiltin = !!editing.is_builtin;
    setSavingEdit(true);
    try {
      let nextFileUrl = editing.file_url;
      let nextFilePath = editing.file_path;

      if (editFile) {
        if (isBuiltin) {
          alert("Built-in topics cannot replace files.");
          setSavingEdit(false);
          return;
        }
        if (bucketOk === false) {
          alert(bucketMsg || `Bucket "${TOPICS_BUCKET}" not found.`);
          setSavingEdit(false);
          return;
        }
        const newSlug = `${slugify(editTitle)}-${Date.now().toString(36)}`;
        const sanitized = editFile.name.replace(/[^\w.\-]/g, "_");
        const newPath = `${user.id}/${newSlug}/${sanitized}`;

        const { error: upErr } = await supabase.storage
          .from(TOPICS_BUCKET)
          .upload(newPath, editFile, { upsert: false, cacheControl: "3600" });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from(TOPICS_BUCKET).getPublicUrl(newPath);
        nextFileUrl = pub?.publicUrl ?? null;
        const oldPath = nextFilePath;
        nextFilePath = newPath;

        if (oldPath) {
          await supabase.storage.from(TOPICS_BUCKET).remove([oldPath]);
        }
      }

      const { data: updated, error: updErr } = await supabase
        .from("topics")
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          file_url: nextFileUrl,
          file_path: nextFilePath,
        })
        .eq("id", editing.id)
        .select("*")
        .single();
      if (updErr) throw updErr;

      // optionally re-render HTML wrapper after edits
      await callConvertEdge({
        id: updated.id,
        title: updated.title,
        description: updated.description,
        slug: updated.slug,
        file_url: updated.file_url,
      });

      setEditing(null);
      await loadTopics();
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Failed to save changes.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(t: Topic) {
    if (t.is_builtin) {
      alert("Built-in topics cannot be deleted.");
      return;
    }
    const ok = window.confirm(`Delete topic "${t.title}"? This cannot be undone.`);
    if (!ok) return;
    try {
      const { error: delErr } = await supabase.from("topics").delete().eq("id", t.id);
      if (delErr) throw delErr;

      if (t.file_path) {
        await supabase.storage.from(TOPICS_BUCKET).remove([t.file_path]);
      }
      // best-effort: remove rendered html if present
      await supabase.storage.from("topics-rendered").remove([`${t.id}/index.html`]).catch(() => {});

      await loadTopics();
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Failed to delete topic.");
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)` }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: color.deep }}>
              Manage Topics
            </h1>
            <p className="text-sm mt-1" style={{ color: color.steel }}>
              Hi {username}! Upload files to create topics, or edit/delete existing ones.
            </p>
            {bucketOk === false && (
              <p
                className="mt-2 text-xs rounded-md px-3 py-2"
                style={{ background: "#fef3c7", border: "1px solid #fde68a", color: "#92400e" }}
              >
                {bucketMsg}
              </p>
            )}
          </div>
          <Link
            to="/teacherDashboard"
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Create */}
        <motion.div
          className="rounded-2xl p-5 shadow-xl ring-1 mb-6 sm:mb-8"
          style={{ background: "#fff", borderColor: `${color.mist}55` }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: color.deep }}>
            Create New Topic
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-xs mb-1" style={{ color: color.steel }}>
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: color.mist }}
                placeholder="e.g., Evaluating Functions"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs mb-1" style={{ color: color.steel }}>
                Description (optional)
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: color.mist }}
                placeholder="Short summary of the topic"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs mb-1" style={{ color: color.steel }}>
                Upload File (PDF, PPTX, DOCX, images, etc.)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: color.mist, background: "#fff" }}
                accept="*/*"
              />
              <p className="text-xs mt-1" style={{ color: color.steel }}>
                Files are stored in the “{TOPICS_BUCKET}” storage bucket and linked to this topic. We’ll render a web page you can assign to students.
              </p>
            </div>
            <div className="col-span-1 md:col-span-2">
              <button
                disabled={creating}
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow-md disabled:opacity-50"
                style={{ background: color.teal, color: "#fff" }}
              >
                <UploadCloud className="h-4 w-4" />
                {creating ? "Creating..." : "Create Topic"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* List */}
        <motion.div
          className="rounded-2xl p-5 shadow-xl ring-1"
          style={{ background: "#fff", borderColor: `${color.mist}55` }}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: color.deep }}>
            Your Topics
          </h2>

          {loading ? (
            <div className="text-sm" style={{ color: color.steel }}>
              Loading…
            </div>
          ) : topics.length === 0 ? (
            <div className="text-sm" style={{ color: color.steel }}>
              No topics yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full divide-y" style={{ borderColor: color.mist }}>
                <thead style={{ background: `${color.mist}11` }}>
                  <tr>
                    {["Title", "Description", "File / Page", "Created By", "Created", "Actions"].map((h) => (
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
                  {topics.map((t) => {
                    const isBuiltin = !!t.is_builtin;
                    return (
                      <motion.tr key={t.id} variants={itemVariants} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold" style={{ color: color.deep }}>
                              {t.title}
                            </div>
                            {isBuiltin && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                                style={{
                                  background: `${color.teal}15`,
                                  color: color.teal,
                                  border: `1px solid ${color.teal}40`,
                                }}
                                title="This topic is built into the app"
                              >
                                <Shield className="h-3 w-3" /> Built-in
                              </span>
                            )}
                          </div>
                          <div className="text-xs" style={{ color: color.steel }}>
                            /{t.slug}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top text-sm" style={{ color: color.steel }}>
                          {t.description || "—"}
                        </td>

                        <td className="px-4 py-3 align-top">
                          {t.route_path ? (
                            <Link
                              to={t.route_path}
                              className="inline-flex items-center gap-2 text-sm underline"
                              style={{ color: color.teal }}
                              title={t.html_url || undefined}
                            >
                              <FileText className="h-4 w-4" />
                              Open Page
                            </Link>
                          ) : t.file_url ? (
                            <a
                              href={t.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-sm underline"
                              style={{ color: color.teal }}
                              title={t.file_url}
                            >
                              <FileText className="h-4 w-4" />
                              Open File
                            </a>
                          ) : (
                            <span className="text-sm" style={{ color: color.steel }}>
                              No file
                            </span>
                          )}
                        </td>

                        {/* Created By (email) */}
                        <td className="px-4 py-3 align-top text-sm" style={{ color: color.steel }}>
                          {t.created_by_email || t.created_by || "—"}
                        </td>

                        {/* Created At */}
                        <td className="px-4 py-3 align-top text-sm" style={{ color: color.steel }}>
                          {new Date(t.created_at).toLocaleString()}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(t)}
                              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                              style={{ borderColor: color.mist, color: color.deep, background: "#fff" }}
                              disabled={isBuiltin}
                              title={isBuiltin ? "Built-in topics are edited in code" : "Edit"}
                            >
                              <PencilLine className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(t)}
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm disabled:opacity-50"
                              style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }}
                              disabled={isBuiltin}
                              title={isBuiltin ? "Built-in topics cannot be deleted" : "Delete"}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => !savingEdit && setEditing(null)} />
          <div
            className="relative w-full max-w-xl rounded-2xl p-6 shadow-2xl"
            style={{ background: "#fff", border: `1px solid ${color.mist}` }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold" style={{ color: color.deep }}>
                Edit Topic
              </h3>
              <button onClick={() => !savingEdit && setEditing(null)} className="rounded-full p-1" aria-label="Close edit">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: color.steel }}>
                  Title
                </label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: color.mist }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: color.steel }}>
                  Description
                </label>
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: color.mist }}
                />
              </div>
              {!editing.is_builtin && (
                <div>
                  <label className="block text-xs mb-1" style={{ color: color.steel }}>
                    Replace File (optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: color.mist, background: "#fff" }}
                    accept="*/*"
                  />
                </div>
              )}
              {editing.is_builtin && (
                <p className="text-xs" style={{ color: color.steel }}>
                  This is a built-in topic (code page). Replace file is disabled.
                </p>
              )}
              <div className="flex items-center gap-2 pt-2">
                <button
                  disabled={savingEdit}
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow disabled:opacity-50"
                  style={{ background: color.teal, color: "#fff" }}
                >
                  <Save className="h-4 w-4" />
                  {savingEdit ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => !savingEdit && setEditing(null)}
                  className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold"
                  style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
