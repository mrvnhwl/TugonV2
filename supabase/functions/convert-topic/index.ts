import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { marked } from "https://esm.sh/marked@5";

const SUPABASE_URL = Deno.env.get("SB_URL")!;
const SERVICE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")!;
const RENDER_BUCKET = "topics-rendered";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Basic HTML wrapper
function makeHTML(title: string, desc: string | null, content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.6; }
  h1,h2,h3 { color:#0f172a; }
  pre { background:#f1f5f9; padding:1rem; border-radius:8px; overflow-x:auto; }
  a { color:#0284c7; }
</style>
</head>
<body>
  <h1>${title}</h1>
  ${desc ? `<p><em>${desc}</em></p>` : ""}
  <hr />
  ${content}
</body>
</html>`;
}

serve(async (req) => {
  try {
    const body = await req.json();
    const { topic_id, title, description, file_url } = body;
    if (!topic_id || !file_url) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Step 1: Download the uploaded file
    const res = await fetch(file_url);
    let content = "";
    try {
      content = await res.text();
    } catch {
      content = `# ${title}\n${description ?? ""}\n\n(File preview not readable.)`;
    }

    // Step 2: Convert markdown/plain text → HTML
    const html = makeHTML(title, description, marked.parse(content));

    // Step 3: Upload the rendered HTML
    const path = `${topic_id}/index.html`;
    const { error: uploadErr } = await supabase.storage
      .from(RENDER_BUCKET)
      .upload(path, new Blob([html], { type: "text/html" }), { upsert: true });
    if (uploadErr) throw uploadErr;

    const { data: pub } = supabase.storage.from(RENDER_BUCKET).getPublicUrl(path);
    const htmlUrl = pub?.publicUrl ?? null;

    // Step 4: Update the topic record
    const { error: updateErr } = await supabase
      .from("topics")
      .update({ status: "ready", html_url: htmlUrl })
      .eq("id", topic_id);
    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ success: true, htmlUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("convert-topic error:", err);
    return new Response(JSON.stringify({ error: err.message ?? String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
