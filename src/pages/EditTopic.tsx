import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import color from "../styles/color";

const TOPICS_BUCKET = import.meta.env.VITE_SUPABASE_TOPICS_BUCKET || "topics";

export default function EditTopic() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [id, setId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data, error } = await supabase
        .from("topics")
        .select("id,title,description,file_url,file_path")
        .eq("slug", slug)
        .maybeSingle();
      if (!error && data) {
        setId(data.id);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setFileUrl(data.file_url);
        setFilePath(data.file_path);
      }
    })();
  }, [slug]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);

    try {
      let nextUrl = fileUrl;
      let nextPath = filePath;

      if (file && user?.id) {
        const sanitized = file.name.replace(/[^\w.\-]/g, "_");
        const newPath = `${user.id}/${slug}/${sanitized}`;
        const { error: upErr } = await supabase.storage
          .from(TOPICS_BUCKET)
          .upload(newPath, file, { upsert: true, cacheControl: "3600" });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from(TOPICS_BUCKET).getPublicUrl(newPath);
        nextUrl = pub?.publicUrl ?? null;

        if (nextPath && nextPath !== newPath) {
          await supabase.storage.from(TOPICS_BUCKET).remove([nextPath]);
        }
        nextPath = newPath;
      }

      const { error: updErr } = await supabase
        .from("topics")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          file_url: nextUrl,
          file_path: nextPath,
        })
        .eq("id", id);

      if (updErr) throw updErr;

      navigate(`/topic/${slug}`);
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Failed to save topic.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to={`/topic/${slug}`} className="underline" style={{ color: color.teal }}>
          ← Back to topic
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4" style={{ color: color.deep }}>
        Edit Topic
      </h1>

      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-xs mb-1" style={{ color: color.steel }}>
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border px-3 py-2"
            style={{ borderColor: color.mist }}
          />
        </div>

        <div>
          <label className="block text-xs mb-1" style={{ color: color.steel }}>
            Description
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border px-3 py-2"
            style={{ borderColor: color.mist }}
          />
        </div>

        <div>
          <label className="block text-xs mb-1" style={{ color: color.steel }}>
            Replace file (optional)
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded border px-3 py-2"
            style={{ borderColor: color.mist, background: "#fff" }}
          />
          {fileUrl && (
            <div className="text-xs mt-1">
              Current file:{" "}
              <a href={fileUrl} target="_blank" rel="noreferrer" className="underline" style={{ color: color.teal }}>
                open
              </a>
            </div>
          )}
        </div>

        <button
          disabled={saving}
          type="submit"
          className="px-4 py-2 rounded font-semibold"
          style={{ background: color.teal, color: "#fff" }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
