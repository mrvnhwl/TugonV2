import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import StudentNavbar from "../components/studentNavbar";
import Footer from "../components/Footer";
import color from "../styles/color";
import { Download, ChevronLeft } from "lucide-react";
import * as mammoth from "mammoth/mammoth.browser";

type TopicRow = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  file_url: string | null;
  html_url?: string | null;
  created_at: string;
  created_by: string;
  created_by_email?: string | null;
};

export default function StudentTopicView() {
  const { slug } = useParams();
  const [topic, setTopic] = useState<TopicRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [docHtml, setDocHtml] = useState("");

  useEffect(() => {
    (async () => {
      if (!slug) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("topics")
        .select("id,title,description,slug,file_url,html_url,created_at,created_by")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) {
        setTopic(null);
        setLoading(false);
        return;
      }

      const base = data as TopicRow;

      // join to get email
      let teacherEmail: string | null = null;
      if (base.created_by) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", base.created_by)
          .maybeSingle();
        teacherEmail = prof?.email ?? null;
      }

      setTopic({ ...base, created_by_email: teacherEmail });

      // load docx preview if needed
      if (base.file_url && /\.docx$/i.test(base.file_url)) {
        try {
          const res = await fetch(base.file_url);
          const arrayBuffer = await res.arrayBuffer();
          const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
          setDocHtml(html);
        } catch (e) {
          console.error(e);
          setDocHtml("<p>Unable to preview this file. Please download it instead.</p>");
        }
      }

      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <StudentNavbar />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center" style={{ color: color.steel }}>
          Loading topic…
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen">
        <StudentNavbar />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: color.deep }}>
            Topic not found
          </h2>
          <Link
            to="/student/topics"
            className="inline-flex items-center gap-2 mt-4 rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{ borderColor: color.mist, background: "#fff", color: color.steel }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Topics
          </Link>
        </div>
      </div>
    );
  }

  const heroGradient = {
    background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
    color: "#fff",
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <StudentNavbar />

      <header className="py-10" style={heroGradient}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-extrabold">{topic.title}</h1>
              {topic.description && <p className="opacity-90 mt-1">{topic.description}</p>}

              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5"
                  style={{ background: "#ffffff22" }}
                >
                  Teacher:&nbsp;<span className="font-semibold">{topic.created_by_email || "—"}</span>
                </span>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5"
                  style={{ background: "#ffffff22" }}
                >
                  Created:&nbsp;<span className="font-semibold">{new Date(topic.created_at).toLocaleString()}</span>
                </span>
                {topic.file_url && (
                  <a
                    href={topic.file_url}
                    download
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
                    style={{ background: "#ffffff", color: color.teal }}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                )}
              </div>
            </div>
            <Link
              to="/student/topics"
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
              style={{ borderColor: "#ffffff88", background: "#fff", color: color.steel }}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Topics
            </Link>
          </div>
        </div>
      </header>

      {/* Preview */}
      <main className="flex-grow max-w-5xl mx-auto px-4 py-8">
        {topic.file_url ? (
          /\.pdf$/i.test(topic.file_url) ? (
            <iframe
              title="PDF Preview"
              src={topic.file_url}
              className="w-full rounded-xl border"
              style={{ borderColor: color.mist, height: 700 }}
            />
          ) : /\.docx$/i.test(topic.file_url) ? (
            <div
              className="rounded-xl border bg-white p-5 prose max-w-none"
              style={{ borderColor: color.mist }}
              dangerouslySetInnerHTML={{ __html: docHtml }}
            />
          ) : (
            <a
              href={topic.file_url}
              target="_blank"
              rel="noreferrer"
              className="block w-fit mx-auto mt-6 px-5 py-3 rounded-xl border text-sm font-semibold"
              style={{
                color: color.teal,
                borderColor: color.teal,
                background: "#fff",
              }}
            >
              Open attached file
            </a>
          )
        ) : (
          <div className="text-sm" style={{ color: color.steel }}>
            No file attached for this topic.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
