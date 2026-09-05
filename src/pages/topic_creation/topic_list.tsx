// src/pages/topic_creation/topic_list.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import { supabase } from "../../lib/supabase";
import color from "../../styles/color";
import { Eye, Search } from "lucide-react";

interface PublishedTopicCard {
  id: string;
  title: string;
  about_refined: string;
  view_count: number;
  creator_full_name: string | null;
  published_at: string;
}

function TopicList() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<PublishedTopicCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Theme helpers
  const subtleShadow = "0 10px 25px rgba(0,0,0,0.06)";
  const cardBorder = { borderColor: `${color.mist}66` };
  const heroGradient = {
    background: `linear-gradient(135deg, ${color.teal} 0%, ${color.aqua} 100%)`,
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("published_topics")
        .select("id, title, about_refined, view_count, creator_full_name, published_at")
        .eq("is_active", true)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Error fetching topics:", error);
        return;
      }

      setTopics(data || []);
    } catch (err) {
      console.error("Error loading topics:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTopics = topics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.about_refined.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <header className="relative" style={heroGradient}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <BackButton />
          <div className="mt-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              📚 Published Topics
            </h1>
            <p className="mt-2 text-white/90 text-lg">
              Explore all available learning topics
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
        {/* Search Bar */}
        <section
          className="rounded-2xl border bg-white p-4 -mt-8 mb-8"
          style={{ ...cardBorder, boxShadow: subtleShadow }}
        >
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              size={20}
              style={{ color: color.steel }}
            />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none text-base"
              style={{
                border: `1px solid ${color.mist}66`,
                color: color.deep,
              }}
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow = `0 0 0 3px ${color.aqua}33`)
              }
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent"
              style={{ color: color.teal }}
            />
            <p className="mt-4" style={{ color: color.steel }}>
              Loading topics...
            </p>
          </div>
        )}

        {/* No Topics */}
        {!loading && filteredTopics.length === 0 && (
          <div className="text-center py-20">
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: `${color.mist}33` }}
            >
              <span className="text-3xl">📚</span>
            </div>
            <p className="mt-4 text-lg font-semibold" style={{ color: color.deep }}>
              {searchTerm ? "No topics match your search" : "No topics available yet"}
            </p>
            <p className="mt-2 text-sm" style={{ color: color.steel }}>
              {searchTerm
                ? "Try a different search term"
                : "Check back later for new content"}
            </p>
          </div>
        )}

        {/* Topics Grid */}
        {!loading && filteredTopics.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm" style={{ color: color.steel }}>
                Showing <strong>{filteredTopics.length}</strong> topic
                {filteredTopics.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-xl border bg-white overflow-hidden transition-all cursor-pointer"
                  style={{ ...cardBorder, boxShadow: subtleShadow }}
                  onClick={() => navigate(`/topic/${topic.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = subtleShadow;
                  }}
                >
                  {/* Card Header */}
                  <div
                    className="p-4"
                    style={{ background: `${color.teal}11` }}
                  >
                    <h3
                      className="font-bold text-lg line-clamp-2"
                      style={{ color: color.deep }}
                    >
                      {topic.title}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <p
                      className="text-sm leading-relaxed line-clamp-3 mb-4"
                      style={{ color: color.steel }}
                    >
                      {topic.about_refined}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs" style={{ color: color.steel }}>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {topic.view_count}
                        </span>
                        {topic.creator_full_name && (
                          <span className="truncate max-w-[120px]" title={topic.creator_full_name}>
                            ✍️ {topic.creator_full_name}
                          </span>
                        )}
                      </div>
                      <span className="text-xs">
                        {new Date(topic.published_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div
                    className="px-4 py-3 border-t"
                    style={{ borderColor: `${color.mist}44` }}
                  >
                    <button
                      className="w-full py-2 rounded-lg font-semibold transition-colors text-sm"
                      style={{
                        background: `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
                        color: "#fff",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/topic/${topic.id}`);
                      }}
                    >
                      View Topic →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default TopicList;
