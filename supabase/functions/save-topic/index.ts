// supabase/functions/save-topic/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SB_URL")!;
const SERVICE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")!;
const RENDER_BUCKET = "topics-rendered";
const TOPICS_BUCKET = "topics";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function isTexty(path: string | null): boolean {
  if (!path) return false;
  return /\.(md|markdown|txt|html?|csv)$/i.test(path);
}

serve(async (req) => {
  try {
    const { topic_id, content, as_html } = await req.json();
    if (!topic_id || typeof content !== "string") {
      return new Response("Missing topic_id or content", { status: 400 });
    }

    // Load the topic so we know where to write
    const { data: topic, error: loadErr } = await supabase
      .from("topics")
      .select("id, file_path, file_url, html_url, title, description")
      .eq("id", topic_id)
      .single();

    if (loadErr || !topic) throw loadErr ?? new Error("Topic not found");

    // Decide where to save
    let newFilePath = topic.file_path as string | null;
    let targetBucket = TOPICS_BUCKET;

    if (!isTexty(topic.file_path)) {
      // If original is non-texty, save edited content as an HTML page in the rendered bucket
      targetBucket = RENDER_BUCKET;
      newFilePath = `${topic_id}/index.html`;
    }

    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const { error: upErr } = await supabase.storage
      .from(targetBucket)
      .upload(newFilePath!, blob, { upsert: true, cacheControl: "0" });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from(targetBucket).getPublicUrl(newFilePath!);
    const publicUrl = pub?.publicUrl ?? null;

    // Update DB pointers so the UI uses the edited file when user “Open File”
    // If we wrote to topics-rendered, switch the topic to use html_url/ready.
    // If we overwrote the original in topics, update file_url and keep status ready.
    const updates: Record<string, any> = { status: "ready", status_message: null };
    if (targetBucket === RENDER_BUCKET) {
      updates.html_url = publicUrl;
      // Point "Open Page" to the route-based page; "Open File" stays original.
      // If you prefer "Open File" to be the edited HTML, uncomment next 2 lines:
      // updates.file_path = newFilePath;
      // updates.file_url  = publicUrl;
    } else {
      updates.file_path = newFilePath;
      updates.file_url = publicUrl;
    }

    const { error: updErr } = await supabase.from("topics").update(updates).eq("id", topic_id);
    if (updErr) throw updErr;

    return new Response(JSON.stringify({ ok: true, url: publicUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("save-topic error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
