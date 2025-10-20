// src/pages/TopicView.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import color from "../styles/color";
// @ts-ignore mammoth has no TS types for browser build
import * as mammoth from "mammoth/mammoth.browser";
import Footer from "../components/Footer";

type TopicRow = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  file_url: string | null;
  html_url?: string | null;
  status?: "pending" | "ready" | "error" | null;
  status_message?: string | null;
  created_at: string;
  created_by?: string | null;
};

const RENDER_BUCKET = "topics-rendered";

export default function TopicView() {
  const { slug } = useParams();
  const [topic, setTopic] = useState<TopicRow | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDocx, setIsDocx] = useState(false);
  const [docHtml, setDocHtml] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data, error } = await supabase
        .from("topics")
        .select(
          "id,title,description,slug,file_url,html_url,status,status_message,created_at,created_by"
        )
        .eq("slug", slug)
        .maybeSingle();

      if (!error) setTopic((data as TopicRow) ?? null);
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    (async () => {
      if (!topic?.file_url) return;
      const docx =
        /\.docx$/i.test(topic.file_url) ||
        topic.file_url.includes(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
      setIsDocx(docx);

      if (docx) {
        try {
          const res = await fetch(topic.file_url);
          const arrayBuffer = await res.arrayBuffer();
          const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
          setDocHtml(html || "<p></p>");
        } catch (e) {
          console.error("DOCX → HTML failed:", e);
        }
      }
    })();
  }, [topic]);

  async function saveEditedHtml() {
    if (!topic) return;

    // ensure we are the owner when writing
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes?.user) {
      alert("Please sign in again.");
      return;
    }
    const userId = userRes.user.id;

    setSaving(true);
    try {
      const htmlToSave =
        editorRef.current?.innerHTML?.trim() || docHtml || "<p></p>";

      // save rendered HTML
      const blob = new Blob([wrapHtml(topic.title, htmlToSave)], {
        type: "text/html;charset=utf-8",
      });
      const path = `${topic.id}/index.html`;
      const { error: upErr } = await supabase.storage
        .from(RENDER_BUCKET)
        .upload(path, blob, { upsert: true, cacheControl: "60" });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage
        .from(RENDER_BUCKET)
        .getPublicUrl(path);
      const publicUrl = pub?.publicUrl ?? null;

      // update row; force owner match both in WHERE and in payload
      const { data: updated, error: updErr } = await supabase
        .from("topics")
        .update({
          html_url: publicUrl,
          status: "ready",
          status_message: null,
          created_by: userId, // keep owner the same to satisfy WITH CHECK
        })
        .eq("id", topic.id)
        .eq("created_by", userId) // ensure we only touch our own row
        .select("*")
        .maybeSingle();

      if (updErr) {
        alert(
          "Update blocked by RLS.\n\nMake sure you're logged in as the creator and the row's created_by matches your auth.uid()."
        );
        throw updErr;
      }

      if (updated) setTopic(updated as TopicRow);
      alert("Saved! The rendered page is updated.");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  // Download the edited content as DOCX (no build errors; loads UMD at runtime)
  async function downloadEditedDocx() {
    if (!topic) return;
    setDownloading(true);
    try {
      const htmlToSave =
        editorRef.current?.innerHTML?.trim() || docHtml || "<p></p>";
      const fullHtml = wrapHtml(topic.title, htmlToSave);

      // Load html-docx-js (UMD) only in browser to avoid Vite/ESM errors
      await ensureHtmlDocxJs();
      // @ts-ignore
      const blob = (window as any).htmlDocx.asBlob(fullHtml, { orientation: "portrait" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${safeFileName(topic.title || "topic")}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error(e);
      alert("Failed to create DOCX.");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm" style={{ color: color.steel }}>
          Loading…
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="rounded-lg border p-6 text-center"
          style={{ borderColor: color.mist }}
        >
          <h2 className="font-bold text-lg" style={{ color: color.deep }}>
            Topic not found
          </h2>
          <p className="text-sm mt-1" style={{ color: color.steel }}>
            The topic you’re looking for doesn’t exist.
          </p>
          <Link
            to="/teacherDashboard"
            className="inline-block mt-4 underline"
            style={{ color: color.teal }}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header
        className="py-10"
        style={{
          background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
          color: "#fff",
        }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-extrabold">{topic.title}</h1>
            {topic.status && (
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  background:
                    topic.status === "ready"
                      ? "#dcfce7"
                      : topic.status === "error"
                      ? "#fee2e2"
                      : "#fef3c7",
                  color:
                    topic.status === "ready"
                      ? "#166534"
                      : topic.status === "error"
                      ? "#991b1b"
                      : "#92400e",
                }}
              >
                {topic.status}
              </span>
            )}
          </div>
          {topic.description && (
            <p className="opacity-90 mt-1">{topic.description}</p>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-4 py-8">
        {topic.html_url && (
          <div className="mb-4">
            <a
              href={topic.html_url}
              target="_blank"
              rel="noreferrer"
              className="underline"
              style={{ color: color.teal }}
            >
              Open rendered page
            </a>
          </div>
        )}

        {isDocx ? (
          <div className="space-y-3">
            <div
              ref={editorRef}
              className="rounded-xl border p-4 focus:outline-none"
              style={{ borderColor: color.mist, minHeight: 300 }}
              contentEditable
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: docHtml }}
            />
            <div className="flex items-center gap-2">
              <button
                disabled={saving}
                onClick={saveEditedHtml}
                className="rounded-xl px-4 py-2 font-semibold shadow-md disabled:opacity-50"
                style={{ background: color.teal, color: "#fff" }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                disabled={downloading}
                onClick={downloadEditedDocx}
                className="rounded-xl px-4 py-2 font-semibold shadow-md disabled:opacity-50"
                style={{ background: "#0ea5e9", color: "#fff" }}
              >
                {downloading ? "Preparing…" : "Download DOCX"}
              </button>
              {topic.file_url && (
                <a
                  href={topic.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-sm"
                  style={{ color: color.steel }}
                >
                  Download original DOCX
                </a>
              )}
            </div>
            <p className="text-xs" style={{ color: color.steel }}>
              Note: some complex Word features (headers/footers, text boxes,
              footnotes, tracked changes) may not round-trip perfectly between
              DOCX ↔ HTML ↔ DOCX.
            </p>
          </div>
        ) : topic.file_url ? (
          <div className="rounded-xl border p-4" style={{ borderColor: color.mist }}>
            {/\.(pdf)$/i.test(topic.file_url) ? (
              <iframe title="Topic file" src={topic.file_url} className="w-full" style={{ height: 600 }} />
            ) : (
              <a href={topic.file_url} target="_blank" rel="noreferrer" className="underline" style={{ color: color.teal }}>
                Open attached file
              </a>
            )}
          </div>
        ) : (
          <div className="text-sm" style={{ color: color.steel }}>
            No file attached.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function wrapHtml(title: string, body: string) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;margin:24px;color:#0f172a}
  h1,h2,h3,h4{color:#0b1220}
  img{max-width:100%;height:auto}
  table{border-collapse:collapse}
  td,th{border:1px solid #e5e7eb;padding:6px}
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
${body}
</body>
</html>`;
}
function escapeHtml(s: string) {
  return s.replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]!));
}

// Load html-docx-js (UMD) only in browser to avoid Vite/ESM build errors.
function ensureHtmlDocxJs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).htmlDocx) return resolve();
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/html-docx-js/dist/html-docx.min.js";
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

function safeFileName(s: string) {
  return s.replace(/[^a-z0-9\-_.]+/gi, "_").slice(0, 80);
}
