// src/pages/topic_creation/topic_presenter.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import color from "../../styles/color";

console.log("🚀 TopicPresenter module loaded");

interface PublishedTopic {
  id: string;
  title: string;
  about_refined: string;
  terms_expounded: Array<{
    term: string;
    explanation: string;
  }>;
  video_image_link: string | null;
  creator_full_name: string | null;
  publisher_full_name: string | null;
  published_at: string;
  view_count: number;
}

function TopicPresenter() {
  console.log("🎬 TopicPresenter function component called");
  
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  
  console.log("🔑 topicId from useParams:", topicId);
  
  const [topic, setTopic] = useState<PublishedTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme helpers (matching Introduction topic styling)
  const subtleShadow = "0 10px 25px rgba(0,0,0,0.06)";
  const cardBorder = { borderColor: `${color.mist}66` };
  const heroGradient = {
    background: `linear-gradient(135deg, ${color.teal} 0%, ${color.aqua} 100%)`,
  };

  useEffect(() => {
    console.log("🔍 TopicPresenter mounted, topicId:", topicId);
    loadTopic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const loadTopic = async () => {
    console.log("📡 loadTopic called with topicId:", topicId);
    
    if (!topicId) {
      console.error("❌ No topic ID provided");
      setError("No topic ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔎 Fetching topic from Supabase...");
      
      // Fetch topic from published_topics table
      const { data, error: fetchError } = await supabase
        .from("published_topics")
        .select("*")
        .eq("id", topicId)
        .eq("is_active", true)
        .eq("status", "published")
        .single();

      console.log("📥 Supabase response:", { data, error: fetchError });

      if (fetchError) {
        console.error("❌ Error fetching topic:", fetchError);
        setError("Topic not found or is no longer published.");
        setLoading(false);
        return;
      }

      if (!data) {
        console.error("❌ No data returned from Supabase");
        setError("Topic not found.");
        setLoading(false);
        return;
      }

      console.log("✅ Topic loaded successfully:", data.title);
      setTopic(data as PublishedTopic);

      // Increment view count
      console.log("📊 Incrementing view count...");
      await supabase
        .from("published_topics")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", topicId);
    } catch (err: any) {
      console.error("❌ Error loading topic:", err);
      setError("Failed to load topic. Please try again.");
    } finally {
      console.log("🏁 Loading complete. Loading state:", false);
      setLoading(false);
    }
  };

  // Extract YouTube video ID from various URL formats
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
      /youtube\.com\/watch\?.*v=([^&]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <header className="relative" style={heroGradient}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <BackButton />
            <div className="mt-4 text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Loading...
              </h1>
            </div>
          </div>
          <svg viewBox="0 0 1440 120" className="block w-full" aria-hidden="true">
            <path
              d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,96 L1440,120 L0,120 Z"
              fill="#ffffff"
            />
          </svg>
        </header>

        <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="text-center py-20">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: color.teal }}
            />
            <p className="mt-4" style={{ color: color.steel }}>
              Loading topic...
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <header className="relative" style={heroGradient}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <BackButton />
            <div className="mt-4 text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Error
              </h1>
            </div>
          </div>
          <svg viewBox="0 0 1440 120" className="block w-full" aria-hidden="true">
            <path
              d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,96 L1440,120 L0,120 Z"
              fill="#ffffff"
            />
          </svg>
        </header>

        <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div
            className="rounded-2xl border bg-white p-6 md:p-7 -mt-8 text-center"
            style={{ ...cardBorder, boxShadow: subtleShadow }}
          >
            <p className="text-lg" style={{ color: color.steel }}>
              {error || "Topic not found"}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-2 rounded-lg font-semibold transition"
              style={{
                background: color.teal,
                color: "#fff",
                boxShadow: subtleShadow,
              }}
            >
              Go Back
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const youtubeId = topic.video_image_link ? extractYouTubeId(topic.video_image_link) : null;

  console.log("🎨 Rendering TopicPresenter - Topic:", topic?.title, "Loading:", loading, "Error:", error);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <header className="relative" style={heroGradient}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <BackButton />
          <div className="mt-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {topic.title}
            </h1>
            <p className="mt-2 text-white/90 text-sm">
              Published by {topic.publisher_full_name || "Unknown"} •{" "}
              {new Date(topic.published_at).toLocaleDateString()} •{" "}
              {topic.view_count} {topic.view_count === 1 ? "view" : "views"}
            </p>
          </div>
        </div>
        <svg viewBox="0 0 1440 120" className="block w-full" aria-hidden="true">
          <path
            d="M0,64 C240,96 480,0 720,32 C960,64 1200,128 1440,96 L1440,120 L0,120 Z"
            fill="#ffffff"
          />
        </svg>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* About Section */}
        <section
          className="rounded-2xl border bg-white p-6 md:p-7 -mt-8"
          style={{ ...cardBorder, boxShadow: subtleShadow }}
        >
          <h2 className="text-xl font-semibold mb-3" style={{ color: color.deep }}>
            About This Topic
          </h2>
          <p className="leading-relaxed" style={{ color: color.steel }}>
            {topic.about_refined}
          </p>
        </section>

        {/* Key Terms & Explanations */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: color.deep }}>
            Key Terms & Explanations
          </h2>
          <div className="space-y-5">
            {topic.terms_expounded.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border bg-white p-5 md:p-6"
                style={{ ...cardBorder, boxShadow: subtleShadow }}
              >
                <h3
                  className="text-lg font-bold mb-3"
                  style={{ color: color.teal }}
                >
                  {index + 1}. {item.term}
                </h3>
                <p className="leading-relaxed" style={{ color: color.steel }}>
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Video Section */}
        {topic.video_image_link && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: color.deep }}>
              Related Video
            </h2>
            <div
              className="rounded-xl border overflow-hidden bg-white"
              style={{ ...cardBorder, boxShadow: subtleShadow }}
            >
              {youtubeId ? (
                <iframe
                  width="100%"
                  height="500"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={topic.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="p-6 text-center">
                  <p style={{ color: color.steel }}>
                    Video link provided, but format not recognized.
                  </p>
                  <a
                    href={topic.video_image_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block px-4 py-2 rounded-lg font-semibold transition"
                    style={{
                      background: color.teal,
                      color: "#fff",
                      boxShadow: subtleShadow,
                    }}
                  >
                    Open Video Link
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Topic Metadata */}
        <section className="mt-8">
          <div
            className="rounded-xl border p-5"
            style={{
              ...cardBorder,
              background: `${color.aqua}0D`,
              boxShadow: subtleShadow,
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: color.deep }}>
              Topic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <p style={{ color: color.steel }}>
                  <strong>Created by:</strong> {topic.creator_full_name || "Unknown"}
                </p>
              </div>
              <div>
                <p style={{ color: color.steel }}>
                  <strong>Published by:</strong> {topic.publisher_full_name || "Unknown"}
                </p>
              </div>
              <div>
                <p style={{ color: color.steel }}>
                  <strong>Published on:</strong>{" "}
                  {new Date(topic.published_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{ color: color.steel }}>
                  <strong>Total views:</strong> {topic.view_count}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default TopicPresenter;
