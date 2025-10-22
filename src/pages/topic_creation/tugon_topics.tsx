import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Eye, CheckCircle, XCircle, Loader, Send, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";


/* ----------------------------- Color Palette (from TopicSelector) ----------------------------- */

const color = {
  teal: "#14b8a6",
  deep: "#0f172a",
  steel: "#64748b",
  mist: "#cbd5e1",
  ocean: "#0ea5e9",
};

/* ----------------------------- Types ----------------------------- */

interface TopicSubmission {
  id: string;
  title: string;
  about: string;
  terms: string[];
  video_image_link: string | null;
  status: "pending" | "validated" | "rejected" | "draft_ready";
  created_by: string;
  created_at: string;
  rejection_reason?: string | null;
}

interface DraftTopic {
  id: string;
  submission_id: string;
  title: string;
  about_refined: string;
  terms_expounded: { term: string; explanation: string }[];
  video_image_link: string | null;
  status: "pending_approval" | "published" | "rejected";
  is_active: boolean;
  created_at: string;
  creator_name?: string;
  original_title?: string;
}

interface ValidationResult {
  submission_id: string;
  validation_response: string;
  validation_reason: string;
  validation_details: any;
  created_at: string;
}

/* ----------------------------- Helper Components ----------------------------- */

// Component to handle validated topic buttons with status check
function ValidatedTopicButtons({ 
  submission, 
  user, 
  isTeacher, 
  onRefresh,
  onView,
  onEdit,
  onDelete
}: { 
  submission: TopicSubmission; 
  user: any; 
  isTeacher: boolean;
  onRefresh: () => void;
  onView: (draft: DraftTopic) => void;
  onEdit: (draft: DraftTopic) => void;
  onDelete: (draft: DraftTopic) => void;
}) {
  const [teacherTopicStatus, setTeacherTopicStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTeacherTopicStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("teacher_topics")
          .select("status")
          .eq("submission_id", submission.id)
          .maybeSingle();

        if (!error && data) {
          setTeacherTopicStatus(data.status);
        }
      } catch (err) {
        console.error("Error checking teacher_topic status:", err);
      } finally {
        setLoading(false);
      }
    };

    checkTeacherTopicStatus();
  }, [submission.id]);

  // Don't render buttons if status is "published"
  if (loading) {
    return (
      <div className="flex gap-2 mt-3">
        <span className="text-sm" style={{ color: color.steel }}>Loading...</span>
      </div>
    );
  }

  if (teacherTopicStatus === "published") {
    return (
      <div className="flex gap-2 mt-3">
        <span 
          className="px-3 py-1.5 rounded-lg text-sm font-semibold"
          style={{ background: "#d1fae5", color: "#065f46" }}
        >
          ✓ This topic is published. View it in the Published Topics tab.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <button
        onClick={async () => {
          const { data, error } = await supabase
            .from("teacher_topics")
            .select("*")
            .eq("submission_id", submission.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching topic:", error);
            alert(`Failed to load topic details: ${error.message}\nCode: ${error.code}\nHint: ${error.hint || 'Check RLS policies'}`);
            return;
          }

          if (!data) {
            alert("No teacher topic found for this submission. It may have been deleted or you don't have permission to view it.");
            return;
          }

          onView(data as DraftTopic);
        }}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
        style={{ background: color.ocean, color: "#fff" }}
      >
        <Eye size={14} />
        View
      </button>
      <button
        onClick={async () => {
          const { data, error } = await supabase
            .from("teacher_topics")
            .select("*")
            .eq("submission_id", submission.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching topic:", error);
            alert(`Failed to load topic details: ${error.message}\nCode: ${error.code}\nHint: ${error.hint || 'Check RLS policies'}`);
            return;
          }

          if (!data) {
            alert("No teacher topic found for this submission. It may have been deleted or you don't have permission to view it.");
            return;
          }

          onEdit(data as DraftTopic);
        }}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
        style={{ background: color.teal, color: "#fff" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit
      </button>
      {isTeacher && (
        <button
          onClick={async () => {
            const { data, error } = await supabase
              .from("teacher_topics")
              .select("*")
              .eq("submission_id", submission.id)
              .maybeSingle();

            if (error) {
              console.error("Error fetching topic:", error);
              alert(`Failed to load topic: ${error.message}\nCode: ${error.code}`);
              return;
            }

            if (!data) {
              alert("No teacher topic found for this submission.");
              return;
            }

            const confirmPublish = window.confirm(
              `Are you sure you want to publish "${data.title}"?\n\nThis will make it visible to all students.`
            );
            
            if (confirmPublish) {
              const { error: publishError } = await supabase
                .from("teacher_topics")
                .update({
                  status: "published",
                  is_active: true,
                  reviewed_by: user?.id,
                  reviewed_at: new Date().toISOString(),
                })
                .eq("id", data.id);

              if (publishError) {
                console.error("Error publishing topic:", publishError);
                alert(`Failed to publish: ${publishError.message}`);
              } else {
                alert("✅ Topic published successfully!");
                onRefresh();
              }
            }
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: "#10b981", color: "#fff" }}
        >
          <CheckCircle size={14} />
          Publish
        </button>
      )}
      <button
        onClick={async () => {
          const { data, error } = await supabase
            .from("teacher_topics")
            .select("*")
            .eq("submission_id", submission.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching topic:", error);
            alert(`Failed to load topic: ${error.message}`);
            return;
          }

          if (!data) {
            alert("No teacher topic found for this submission.");
            return;
          }

          onDelete(data as DraftTopic);
        }}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
        style={{ background: "#ef4444", color: "#fff" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Delete
      </button>
    </div>
  );
}

/* ----------------------------- Main Component ----------------------------- */

export default function TugonTopics() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Submission form state
  const [submissionTitle, setSubmissionTitle] = useState("");
  const [submissionAbout, setSubmissionAbout] = useState("");
  const [submissionTerms, setSubmissionTerms] = useState<string[]>(["", "", ""]);
  const [submissionVideoLink, setSubmissionVideoLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // User submissions state
  const [mySubmissions, setMySubmissions] = useState<TopicSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  // User role state (fetch from profiles table)
  const [userRole, setUserRole] = useState<string | null>(null);

  // Teacher drafts state
  const [pendingDrafts, setPendingDrafts] = useState<DraftTopic[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<DraftTopic | null>(null);

  // Published topics state
  const [publishedTopics, setPublishedTopics] = useState<any[]>([]);
  const [loadingPublished, setLoadingPublished] = useState(false);
  const [showPublishedModal, setShowPublishedModal] = useState(false);
  const [selectedPublishedTopic, setSelectedPublishedTopic] = useState<any | null>(null);

  // Validation details state
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedValidation, setSelectedValidation] = useState<ValidationResult | null>(null);
  const [loadingValidation, setLoadingValidation] = useState(false);

  // Edit topic state
  const [showEditModal, setShowEditModal] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<DraftTopic | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAbout, setEditAbout] = useState("");
  const [editTerms, setEditTerms] = useState<{ term: string; explanation: string }[]>([]);
  const [editVideoLink, setEditVideoLink] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<DraftTopic | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<"submit" | "my-submissions" | "review-drafts" | "published-topics">(
    "submit"
  );

  /* ----------------------------- Load Data ----------------------------- */

  useEffect(() => {
    if (user) {
      loadMySubmissions();
      loadUserRole();
      // Only load drafts if user is a teacher
      if (user.user_metadata?.role === "teacher") {
        loadPendingDrafts();
      }
    }
  }, [user]);

  const loadUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading user role:", error);
        return;
      }

      console.log("✅ User role loaded:", data?.role);
      setUserRole(data?.role || null);

      // Load drafts if teacher
      if (data?.role === "teacher") {
        loadPendingDrafts();
      }
    } catch (err: any) {
      console.error("Error loading user role:", err);
    }
  };

  const loadMySubmissions = async () => {
    if (!user) return;

    try {
      setLoadingSubmissions(true);

      const { data, error } = await supabase
        .from("topic_submissions")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMySubmissions(data || []);
    } catch (err: any) {
      console.error("Error loading submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const loadPendingDrafts = async () => {
    try {
      setLoadingDrafts(true);

      const { data, error } = await supabase
        .from("teacher_topics_pending_approval")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPendingDrafts(data || []);
    } catch (err: any) {
      console.error("Error loading drafts:", err);
    } finally {
      setLoadingDrafts(false);
    }
  };

  const loadPublishedTopics = async () => {
    try {
      setLoadingPublished(true);

      const { data, error } = await supabase
        .from("published_topics")
        .select("*")
        .eq("is_active", true)
        .order("published_at", { ascending: false });

      if (error) throw error;

      setPublishedTopics(data || []);
    } catch (err: any) {
      console.error("Error loading published topics:", err);
    } finally {
      setLoadingPublished(false);
    }
  };

  /* ----------------------------- Submission Functions ----------------------------- */

  const handleAddTerm = () => {
    if (submissionTerms.length < 10) {
      setSubmissionTerms([...submissionTerms, ""]);
    }
  };

  const handleRemoveTerm = (index: number) => {
    if (submissionTerms.length > 3) {
      setSubmissionTerms(submissionTerms.filter((_, i) => i !== index));
    }
  };

  const handleTermChange = (index: number, value: string) => {
    const newTerms = [...submissionTerms];
    newTerms[index] = value;
    setSubmissionTerms(newTerms);
  };

  const resetSubmissionForm = () => {
    setSubmissionTitle("");
    setSubmissionAbout("");
    setSubmissionTerms(["", "", ""]);
    setSubmissionVideoLink("");
    setSubmissionError(null);
  };

  const submitTopic = async () => {
    if (!user) {
      setSubmissionError("You must be logged in to submit a topic");
      return;
    }

    // Validation
    if (!submissionTitle.trim()) {
      setSubmissionError("Title is required");
      return;
    }

    if (!submissionAbout.trim()) {
      setSubmissionError("About description is required");
      return;
    }

    const validTerms = submissionTerms.filter((t) => t.trim() !== "");
    if (validTerms.length < 1) {
      setSubmissionError("You need to define a terminology here");
      return;
    }

    try {
      setSubmitting(true);
      setSubmissionError(null);

      // Step 1: Create topic submission
      const { data: submission, error: submissionError } = await supabase
        .from("topic_submissions")
        .insert({
          title: submissionTitle.trim(),
          about: submissionAbout.trim(),
          terms: validTerms,
          video_image_link: submissionVideoLink.trim() || null,
          created_by: user.id,
          status: "pending",
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      console.log("✅ Submission created:", submission.id);

      // Step 2: Call validation API (always use production URL since API is deployed on Vercel)
      const apiUrl = "https://tugon-v2-eta.vercel.app/api/topic-creation";

      console.log("📤 Calling API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission.id }),
      });

      console.log("📥 API Response status:", response.status);

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("❌ Non-JSON response received:", text.substring(0, 200));
        throw new Error("API returned non-JSON response. Check if the endpoint exists.");
      }

      const result = await response.json();
      console.log("📥 API Result:", result);

      if (!response.ok) {
        throw new Error(result.error || `API Error: ${response.status} ${response.statusText}`);
      }

      if (result.success) {
        // Success - draft created
        alert(
          "✅ Topic submitted successfully! It has been sent to teachers for review."
        );
        loadMySubmissions();
        resetSubmissionForm();
      } else {
        // Topic rejected by AI
        setSubmissionError(`Topic Rejected: ${result.validation.reason}`);
        // Update submission status
        await supabase
          .from("topic_submissions")
          .update({ status: "rejected" })
          .eq("id", submission.id);
        loadMySubmissions();
      }
    } catch (err: any) {
      console.error("❌ Submission error:", err);
      
      // More detailed error message
      let errorMessage = err.message || "Failed to submit topic";
      
      // Check if it's a JSON parsing error
      if (errorMessage.includes("Unexpected token")) {
        errorMessage = "API Error: The backend endpoint may not be deployed correctly. " +
                      "Please ensure 'api/topic-creation.ts' is committed and deployed to Vercel.";
      }
      
      setSubmissionError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------------------- Validation Details ----------------------------- */

  const viewValidationDetails = async (submissionId: string) => {
    try {
      setLoadingValidation(true);
      setShowValidationModal(true);

      const { data, error } = await supabase
        .from("validation_results")
        .select("*")
        .eq("submission_id", submissionId)
        .maybeSingle();

      if (error) {
        console.error("Error loading validation:", error);
        alert(`Failed to load validation details: ${error.message}\nCode: ${error.code}`);
        setShowValidationModal(false);
        return;
      }

      if (!data) {
        alert("No validation results found for this submission. It may not have been validated yet or you don't have permission to view it.");
        setShowValidationModal(false);
        return;
      }

      setSelectedValidation(data);
    } catch (err: any) {
      console.error("Error loading validation:", err);
      alert(`Failed to load validation details: ${err.message}`);
      setShowValidationModal(false);
    } finally {
      setLoadingValidation(false);
    }
  };

  /* ----------------------------- Teacher Draft Review Functions ----------------------------- */

  const viewDraft = (draft: DraftTopic) => {
    setSelectedDraft(draft);
    setShowDraftModal(true);
  };

  const openEditModal = (draft: DraftTopic) => {
    setTopicToEdit(draft);
    setEditTitle(draft.title);
    setEditAbout(draft.about_refined);
    setEditTerms(draft.terms_expounded);
    setEditVideoLink(draft.video_image_link || "");
    setShowEditModal(true);
  };

  const handleEditTermChange = (index: number, field: "term" | "explanation", value: string) => {
    const newTerms = [...editTerms];
    newTerms[index][field] = value;
    setEditTerms(newTerms);
  };

  const saveEditedTopic = async () => {
    if (!topicToEdit) return;

    if (!editTitle.trim() || !editAbout.trim()) {
      alert("Title and About are required");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("teacher_topics")
        .update({
          title: editTitle.trim(),
          about_refined: editAbout.trim(),
          terms_expounded: editTerms,
          video_image_link: editVideoLink.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", topicToEdit.id);

      if (error) throw error;

      alert("✅ Topic updated successfully!");
      loadMySubmissions();
      loadPendingDrafts();
      setShowEditModal(false);
      setTopicToEdit(null);
    } catch (err: any) {
      console.error("Error updating topic:", err);
      alert(`Failed to update: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteTopic = (draft: DraftTopic) => {
    setTopicToDelete(draft);
    setShowDeleteConfirm(true);
  };

  const deleteTopic = async () => {
    if (!topicToDelete) return;

    try {
      setDeleting(true);

      const { error } = await supabase
        .from("teacher_topics")
        .delete()
        .eq("id", topicToDelete.id);

      if (error) throw error;

      alert("✅ Topic deleted successfully!");
      loadMySubmissions();
      loadPendingDrafts();
      setShowDeleteConfirm(false);
      setTopicToDelete(null);
    } catch (err: any) {
      console.error("Error deleting topic:", err);
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const approveDraft = async () => {
    if (!selectedDraft) return;

    try {
      const { error } = await supabase
        .from("teacher_topics")
        .update({
          status: "published",
          is_active: true,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedDraft.id);

      if (error) throw error;

      alert("✅ Topic approved and published!");
      loadPendingDrafts();
      loadPublishedTopics(); // Refresh published topics list
      setShowDraftModal(false);
      setSelectedDraft(null);
    } catch (err: any) {
      console.error("Error approving draft:", err);
      alert(`Failed to approve: ${err.message}`);
    }
  };

  const rejectDraft = async () => {
    if (!selectedDraft) return;

    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    try {
      // Update draft status
      await supabase
        .from("teacher_topics")
        .update({ status: "rejected" })
        .eq("id", selectedDraft.id);

      // Update submission
      await supabase
        .from("topic_submissions")
        .update({
          status: "rejected",
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq("id", selectedDraft.submission_id);

      alert("❌ Topic rejected");
      loadPendingDrafts();
      setShowDraftModal(false);
      setSelectedDraft(null);
    } catch (err: any) {
      console.error("Error rejecting draft:", err);
      alert(`Failed to reject: ${err.message}`);
    }
  };

  /* ----------------------------- Status Badge ----------------------------- */

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: "#fef3c7", text: "#92400e", icon: Loader },
      validated: { bg: "#d1fae5", text: "#065f46", icon: CheckCircle },
      rejected: { bg: "#fee2e2", text: "#991b1b", icon: XCircle },
      draft_ready: { bg: "#dbeafe", text: "#1e40af", icon: Eye },
    };

    const style = styles[status] || styles.pending;
    const Icon = style.icon;

    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
        style={{ background: style.bg, color: style.text }}
      >
        <Icon size={14} />
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  /* ----------------------------- Render ----------------------------- */

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)` }}>
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: color.steel }} />
          <p className="text-lg font-semibold" style={{ color: color.deep }}>
            Please log in to access topic submission
          </p>
        </div>
      </div>
    );
  }

  // Use role from profiles table instead of user_metadata
  const isTeacher = userRole === "teacher";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(to bottom, ${color.mist}11, ${color.ocean}08)` }}
    >
     

      <main className="flex-grow max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1
              className="text-2xl sm:text-3xl font-extrabold mb-2"
              style={{ color: color.deep }}
            >
              Topic Management
            </h1>
            <p className="text-sm sm:text-base" style={{ color: color.steel }}>
              Submit math topic ideas, and Let AI assist in drafting them for you.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("submit")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md ${
                activeTab === "submit" ? "ring-2" : ""
              }`}
              style={{
                background: activeTab === "submit" ? color.teal : color.mist,
                color: activeTab === "submit" ? "#fff" : color.deep,
                ...(activeTab === "submit" && { boxShadow: `0 0 0 2px ${color.teal}` }),
              }}
            >
              <Plus size={18} className="inline mr-2" />
              Add Topic
            </button>

            <button
              onClick={() => setActiveTab("my-submissions")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md ${
                activeTab === "my-submissions" ? "ring-2" : ""
              }`}
              style={{
                background: activeTab === "my-submissions" ? color.ocean : color.mist,
                color: activeTab === "my-submissions" ? "#fff" : color.deep,
                ...(activeTab === "my-submissions" && { boxShadow: `0 0 0 2px ${color.ocean}` }),
              }}
            >
              <Send size={18} className="inline mr-2" />
               Current Topics ({mySubmissions.length})
            </button>

            {isTeacher && (
              <button
                onClick={() => {
                  setActiveTab("review-drafts");
                  loadPendingDrafts();
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md ${
                  activeTab === "review-drafts" ? "ring-2" : ""
                }`}
                style={{
                  background: activeTab === "review-drafts" ? "#8b5cf6" : color.mist,
                  color: activeTab === "review-drafts" ? "#fff" : color.deep,
                  ...(activeTab === "review-drafts" && { boxShadow: `0 0 0 2px #8b5cf6` }),
                }}
              >
                <Eye size={18} className="inline mr-2" />
                Review Drafts ({pendingDrafts.length})
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab("published-topics");
                loadPublishedTopics();
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md ${
                activeTab === "published-topics" ? "ring-2" : ""
              }`}
              style={{
                background: activeTab === "published-topics" ? "#10b981" : color.mist,
                color: activeTab === "published-topics" ? "#fff" : color.deep,
                ...(activeTab === "published-topics" && { boxShadow: `0 0 0 2px #10b981` }),
              }}
            >
              <CheckCircle size={18} className="inline mr-2" />
              Published Topics ({publishedTopics.length})
            </button>
          </div>

          {/* Content Card */}
          <div
            className="rounded-2xl sm:rounded-3xl shadow-xl ring-1"
            style={{ background: "#fff", borderColor: `${color.mist}55` }}
          >
            {/* Submit Topic Tab */}
            {activeTab === "submit" && (
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-bold" style={{ color: color.deep }}>
                  Submit a New Topic
                </h2>

                {submissionError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
                  >
                    <p className="text-red-700 text-sm font-medium">{submissionError}</p>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: color.deep }}>
                      Topic Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={submissionTitle}
                      onChange={(e) => setSubmissionTitle(e.target.value)}
                      disabled={submitting}
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 disabled:bg-gray-100"
                      style={{ borderColor: color.mist }}
                      placeholder="Submit title of your topic here..."
                    />
                  </div>

                  {/* About */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: color.deep }}>
                      About <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={submissionAbout}
                      onChange={(e) => setSubmissionAbout(e.target.value)}
                      disabled={submitting}
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 resize-none disabled:bg-gray-100"
                      style={{ borderColor: color.mist }}
                      placeholder="Describe what this topic covers in General Mathematics..."
                      rows={4}
                    />
                  </div>

                  {/* Terms */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: color.deep }}>
                      Key Terms <span className="text-red-500">* (minimum 3)</span>
                    </label>
                    {submissionTerms.map((term, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={term}
                          onChange={(e) => handleTermChange(index, e.target.value)}
                          disabled={submitting}
                          className="flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 disabled:bg-gray-100"
                          style={{ borderColor: color.mist }}
                          placeholder={`Term ${index + 1}`}
                        />
                        {submissionTerms.length > 3 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTerm(index)}
                            disabled={submitting}
                            className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                    {submissionTerms.length < 10 && (
                      <button
                        type="button"
                        onClick={handleAddTerm}
                        disabled={submitting}
                        className="text-sm font-semibold hover:underline"
                        style={{ color: color.teal }}
                      >
                        + Add another term
                      </button>
                    )}
                  </div>

                  {/* Video/Image Link */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: color.deep }}>
                      Video/Image Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={submissionVideoLink}
                      onChange={(e) => setSubmissionVideoLink(e.target.value)}
                      disabled={submitting}
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 disabled:bg-gray-100"
                      style={{ borderColor: color.mist }}
                      placeholder="https://youtube.com/... or https://example.com/image.jpg"
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div
                  className="p-4 rounded-lg border-l-4"
                  style={{ background: `${color.teal}15`, borderColor: color.teal }}
                >
                  <p className="text-sm" style={{ color: color.deep }}>
                    <strong>Note:</strong> Your topic will be validated by AI to ensure it's appropriate
                    for General Mathematics curriculum.
                  </p>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  onClick={submitTopic}
                  disabled={submitting}
                  className="w-full px-6 py-4 font-bold rounded-xl text-base transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: color.teal, color: "#fff" }}
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader size={20} />
                      </motion.div>
                      Validating with AI...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Topic for Review
                    </>
                  )}
                </motion.button>
              </div>
            )}

            {/* My Submissions Tab */}
            {activeTab === "my-submissions" && (
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: color.deep }}>
                  My Submissions
                </h2>

                {loadingSubmissions ? (
                  <div className="text-center py-12">
                    <motion.div
                      className="inline-block rounded-full h-12 w-12 border-4 border-t-4"
                      style={{ borderColor: `${color.teal}40` }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-sm mt-3" style={{ color: color.steel }}>
                      Loading submissions...
                    </p>
                  </div>
                ) : mySubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle size={48} className="mx-auto mb-4" style={{ color: color.mist }} />
                    <p className="text-lg font-semibold" style={{ color: color.deep }}>
                      No submissions yet
                    </p>
                    <p className="text-sm mt-2" style={{ color: color.steel }}>
                      Submit your first topic to get started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mySubmissions.map((submission) => (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl border hover:shadow-md transition-all"
                        style={{ borderColor: color.mist }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg" style={{ color: color.deep }}>
                              {submission.title}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: color.steel }}>
                              {submission.about.substring(0, 120)}...
                            </p>
                            <p className="text-xs mt-2" style={{ color: color.steel }}>
                              Submitted: {new Date(submission.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(submission.status)}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {submission.terms.slice(0, 3).map((term, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ background: `${color.teal}20`, color: color.teal }}
                            >
                              {term}
                            </span>
                          ))}
                          {submission.terms.length > 3 && (
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ background: `${color.mist}40`, color: color.steel }}
                            >
                              +{submission.terms.length - 3} more
                            </span>
                          )}
                        </div>

                        {submission.status === "rejected" && submission.rejection_reason && (
                          <div
                            className="p-3 rounded-lg border-l-4 mb-3"
                            style={{ background: "#fee2e2", borderColor: "#ef4444" }}
                          >
                            <p className="text-sm font-semibold text-red-900">
                              Rejection Reason:
                            </p>
                            <p className="text-sm text-red-800 mt-1">
                              {submission.rejection_reason}
                            </p>
                          </div>
                        )}

                        {/* Only show validation details for rejected and pending */}
                        {(submission.status === "rejected" || submission.status === "pending") && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <button
                              onClick={() => viewValidationDetails(submission.id)}
                              className="text-sm font-semibold hover:underline flex items-center gap-1"
                              style={{ color: color.ocean }}
                            >
                              <Eye size={16} />
                              View Validation Details
                            </button>

                            {/* Delete button for rejected topics */}
                            {submission.status === "rejected" && (
                              <button
                                onClick={async () => {
                                  const confirmDelete = window.confirm(
                                    `Are you sure you want to delete the topic "${submission.title}"?\n\nThis action cannot be undone.`
                                  );
                                  
                                  if (confirmDelete) {
                                    try {
                                      const { error } = await supabase
                                        .from("topic_submissions")
                                        .delete()
                                        .eq("id", submission.id);

                                      if (error) {
                                        console.error("Error deleting submission:", error);
                                        alert(`Failed to delete: ${error.message}`);
                                      } else {
                                        alert("✅ Topic deleted successfully!");
                                        loadMySubmissions();
                                      }
                                    } catch (err: any) {
                                      console.error("Error deleting submission:", err);
                                      alert(`Failed to delete: ${err.message}`);
                                    }
                                  }
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                                style={{ background: "#ef4444", color: "#fff" }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                Delete
                              </button>
                            )}
                          </div>
                        )}

                        {/* Show View/Edit/Delete/Publish buttons for validated topics (in teacher_topics) */}
                        {submission.status === "validated" && (
                          <ValidatedTopicButtons 
                            submission={submission} 
                            user={user} 
                            isTeacher={isTeacher}
                            onRefresh={loadMySubmissions}
                            onView={viewDraft}
                            onEdit={openEditModal}
                            onDelete={confirmDeleteTopic}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Review Drafts Tab (Teachers Only) */}
            {activeTab === "review-drafts" && isTeacher && (
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: color.deep }}>
                  Pending Draft Reviews
                </h2>

                {loadingDrafts ? (
                  <div className="text-center py-12">
                    <motion.div
                      className="inline-block rounded-full h-12 w-12 border-4 border-t-4"
                      style={{ borderColor: `${color.ocean}40` }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-sm mt-3" style={{ color: color.steel }}>
                      Loading drafts...
                    </p>
                  </div>
                ) : pendingDrafts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle size={48} className="mx-auto mb-4" style={{ color: color.mist }} />
                    <p className="text-lg font-semibold" style={{ color: color.deep }}>
                      No pending drafts
                    </p>
                    <p className="text-sm mt-2" style={{ color: color.steel }}>
                      All drafts have been reviewed!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingDrafts.map((draft) => (
                      <motion.div
                        key={draft.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl border hover:shadow-md transition-all cursor-pointer"
                        style={{ borderColor: color.mist }}
                        onClick={() => viewDraft(draft)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg" style={{ color: color.deep }}>
                              {draft.title}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: color.steel }}>
                              {draft.about_refined.substring(0, 150)}...
                            </p>
                            <p className="text-xs mt-2" style={{ color: color.steel }}>
                              Submitted by: {draft.creator_name || "Unknown"} •{" "}
                              {new Date(draft.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                            style={{ background: "#fef3c7", color: "#92400e" }}
                          >
                            PENDING REVIEW
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <Eye size={16} style={{ color: color.ocean }} />
                          <span className="text-sm font-semibold" style={{ color: color.ocean }}>
                            Click to review
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Published Topics Tab */}
            {activeTab === "published-topics" && (
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: color.deep }}>
                  Published Topics
                </h2>

                {loadingPublished ? (
                  <div className="text-center py-12">
                    <motion.div
                      className="inline-block rounded-full h-12 w-12 border-4 border-t-4"
                      style={{ borderColor: `${color.teal}40` }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-sm mt-3" style={{ color: color.steel }}>
                      Loading published topics...
                    </p>
                  </div>
                ) : publishedTopics.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle size={48} className="mx-auto mb-4" style={{ color: color.mist }} />
                    <p className="text-lg font-semibold" style={{ color: color.deep }}>
                      No published topics yet
                    </p>
                    <p className="text-sm mt-2" style={{ color: color.steel }}>
                      Topics will appear here once they are published by teachers.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {publishedTopics.map((topic) => (
                      <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl border hover:shadow-md transition-all"
                        style={{ borderColor: color.mist }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg" style={{ color: color.deep }}>
                                {topic.title}
                              </h3>
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{ background: "#d1fae5", color: "#065f46" }}
                              >
                                PUBLISHED
                              </span>
                            </div>
                            <p className="text-sm mt-1" style={{ color: color.steel }}>
                              {topic.about_refined.substring(0, 150)}...
                            </p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: color.steel }}>
                              <span>
                                <strong>Created by:</strong> {topic.creator_full_name || "Unknown"}
                              </span>
                              <span>•</span>
                              <span>
                                <strong>Published by:</strong> {topic.publisher_full_name || "Unknown"}
                              </span>
                              <span>•</span>
                              <span>
                                <strong>Published:</strong> {new Date(topic.published_at).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span>
                                <strong>Views:</strong> {topic.view_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {topic.terms_expounded.slice(0, 4).map((term: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ background: `${color.teal}20`, color: color.teal }}
                            >
                              {term.term}
                            </span>
                          ))}
                          {topic.terms_expounded.length > 4 && (
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ background: `${color.mist}40`, color: color.steel }}
                            >
                              +{topic.terms_expounded.length - 4} more
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button
                            onClick={() => navigate(`/topic-presenter/${topic.id}`)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
                            style={{ background: color.ocean, color: "#fff" }}
                          >
                            <Eye size={14} />
                            Open Page
                          </button>
                          
                          {isTeacher && (
                            <button
                              onClick={async () => {
                                const confirmUnpublish = window.confirm(
                                  `⚠️ WARNING: UNPUBLISH TOPIC\n\n` +
                                  `Are you sure you want to unpublish "${topic.title}"?\n\n` +
                                  `This action will:\n` +
                                  `• Permanently delete it from the Published Topics table\n` +
                                  `• Make the topic invisible to all students\n` +
                                  `• Change status to "unpublished" in teacher_topics\n` +
                                  `• Keep it in teacher_topics for future reference\n\n` +
                                  `Click OK to confirm unpublishing.`
                                );
                                
                                if (confirmUnpublish) {
                                  try {
                                    // Step 1: Update teacher_topics - set status to "unpublished" and is_active to false
                                    const { error: teacherTopicError } = await supabase
                                      .from("teacher_topics")
                                      .update({ 
                                        status: "unpublished",
                                        is_active: false 
                                      })
                                      .eq("id", topic.teacher_topic_id);

                                    if (teacherTopicError) {
                                      console.error("Error updating teacher_topics:", teacherTopicError);
                                      alert(`❌ Failed to update teacher_topics: ${teacherTopicError.message}`);
                                      return;
                                    }

                                    // Step 2: Delete the record from published_topics table
                                    const { error: unpublishError } = await supabase
                                      .from("published_topics")
                                      .delete()
                                      .eq("id", topic.id);

                                    if (unpublishError) {
                                      console.error("Error unpublishing topic:", unpublishError);
                                      alert(`❌ Failed to unpublish: ${unpublishError.message}`);
                                    } else {
                                      alert("✅ Topic unpublished successfully!\n\nThe topic has been deleted from the Published Topics table and status changed to 'unpublished' in teacher_topics.");
                                      loadPublishedTopics();
                                    }
                                  } catch (err: any) {
                                    console.error("Error unpublishing:", err);
                                    alert(`❌ Failed to unpublish: ${err.message}`);
                                  }
                                }
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
                              style={{ background: "#f59e0b", color: "#fff" }}
                            >
                              <XCircle size={14} />
                              Unpublish
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* ----------------------------- Validation Details Modal ----------------------------- */}
      <AnimatePresence>
        {showValidationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowValidationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden ring-1"
              style={{ borderColor: `${color.mist}55` }}
            >
              {/* Header */}
              <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ background: color.ocean }}
              >
                <h2 className="text-xl font-bold text-white">Validation Details</h2>
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                {loadingValidation ? (
                  <div className="text-center py-12">
                    <motion.div
                      className="inline-block rounded-full h-12 w-12 border-4 border-t-4"
                      style={{ borderColor: `${color.ocean}40` }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                ) : selectedValidation ? (
                  <div className="space-y-4">
                    {/* Response */}
                    <div>
                      <h3 className="font-semibold text-sm mb-2" style={{ color: color.deep }}>
                        Status
                      </h3>
                      <div
                        className={`p-4 rounded-lg border-l-4 ${
                          selectedValidation.validation_response === "Accepted"
                            ? "bg-green-50 border-green-500"
                            : "bg-red-50 border-red-500"
                        }`}
                      >
                        <p className="font-bold text-lg">
                          {selectedValidation.validation_response}
                        </p>
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <h3 className="font-semibold text-sm mb-2" style={{ color: color.deep }}>
                        Reason
                      </h3>
                      <p className="text-sm" style={{ color: color.steel }}>
                        {selectedValidation.validation_reason}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-12" style={{ color: color.steel }}>
                    No validation data available
                  </p>
                )}
              </div>

              {/* Footer */}
              <div
                className="border-t p-6"
                style={{ borderColor: color.mist, background: `${color.mist}11` }}
              >
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="w-full py-3 rounded-xl font-semibold transition-colors shadow-sm"
                  style={{ background: color.mist, color: color.deep }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------- Draft Review Modal (Teachers) ----------------------------- */}
      <AnimatePresence>
        {showDraftModal && selectedDraft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDraftModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ring-1"
              style={{ borderColor: `${color.mist}55` }}
            >
              {/* Header */}
              <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ background: "#8b5cf6" }}
              >
                <h2 className="text-xl font-bold text-white">Review AI-Generated Draft</h2>
                <button
                  onClick={() => setShowDraftModal(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
                {/* Title */}
                <div>
                  <h3 className="font-semibold text-sm mb-2" style={{ color: color.steel }}>
                    Title
                  </h3>
                  <p className="text-xl font-bold" style={{ color: color.deep }}>
                    {selectedDraft.title}
                  </p>
                </div>

                {/* About */}
                <div>
                  <h3 className="font-semibold text-sm mb-2" style={{ color: color.steel }}>
                    Description
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: color.deep }}>
                    {selectedDraft.about_refined}
                  </p>
                </div>

                {/* Terms & Explanations */}
                <div>
                  <h3 className="font-semibold text-sm mb-3" style={{ color: color.steel }}>
                    Key Terms & Explanations
                  </h3>
                  <div className="space-y-4">
                    {selectedDraft.terms_expounded.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border"
                        style={{ borderColor: color.mist, background: `${color.mist}15` }}
                      >
                        <h4
                          className="font-bold text-base mb-2"
                          style={{ color: color.deep }}
                        >
                          {index + 1}. {item.term}
                        </h4>
                        <p className="text-sm leading-relaxed" style={{ color: color.steel }}>
                          {item.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Link */}
                {selectedDraft.video_image_link && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2" style={{ color: color.steel }}>
                      Media Link
                    </h3>
                    <a
                      href={selectedDraft.video_image_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                      style={{ color: color.ocean }}
                    >
                      {selectedDraft.video_image_link}
                    </a>
                  </div>
                )}

                {/* Metadata */}
                <div
                  className="p-4 rounded-lg"
                  style={{ background: `${color.mist}20` }}
                >
                  <p className="text-xs" style={{ color: color.steel }}>
                    <strong>Submitted by:</strong> {selectedDraft.creator_name || "Unknown"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: color.steel }}>
                    <strong>Original Title:</strong> {selectedDraft.original_title || selectedDraft.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: color.steel }}>
                    <strong>Created:</strong> {new Date(selectedDraft.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div
                className="border-t p-6 flex gap-3"
                style={{ borderColor: color.mist, background: `${color.mist}11` }}
              >
                <button
                  onClick={rejectDraft}
                  className="flex-1 py-3 rounded-xl font-bold transition-colors shadow-md"
                  style={{ background: "#ef4444", color: "#fff" }}
                >
                  <XCircle size={18} className="inline mr-2" />
                  Reject
                </button>
                <button
                  onClick={approveDraft}
                  className="flex-1 py-3 rounded-xl font-bold transition-colors shadow-md"
                  style={{ background: "#10b981", color: "#fff" }}
                >
                  <CheckCircle size={18} className="inline mr-2" />
                  Approve & Publish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------- Edit Topic Modal ----------------------------- */}
      <AnimatePresence>
        {showEditModal && topicToEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ring-1"
              style={{ borderColor: `${color.mist}55` }}
            >
              {/* Header */}
              <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ background: color.teal }}
              >
                <h2 className="text-xl font-bold text-white">Edit Topic</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: color.deep }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: color.mist }}
                  />
                </div>

                {/* About */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: color.deep }}>
                    About
                  </label>
                  <textarea
                    value={editAbout}
                    onChange={(e) => setEditAbout(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{ borderColor: color.mist }}
                    rows={5}
                  />
                </div>

                {/* Terms */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: color.deep }}>
                    Terms & Explanations
                  </label>
                  <div className="space-y-3">
                    {editTerms.map((term, index) => (
                      <div key={index} className="p-3 rounded-lg border" style={{ borderColor: color.mist }}>
                        <input
                          type="text"
                          value={term.term}
                          onChange={(e) => handleEditTermChange(index, "term", e.target.value)}
                          placeholder="Term"
                          className="w-full px-3 py-2 border rounded-lg text-sm mb-2 focus:outline-none focus:ring-2"
                          style={{ borderColor: color.mist }}
                        />
                        <textarea
                          value={term.explanation}
                          onChange={(e) => handleEditTermChange(index, "explanation", e.target.value)}
                          placeholder="Explanation"
                          className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2"
                          style={{ borderColor: color.mist }}
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video/Image Link */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: color.deep }}>
                    Video/Image Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={editVideoLink}
                    onChange={(e) => setEditVideoLink(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: color.mist }}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div
                className="border-t p-6 flex gap-3"
                style={{ borderColor: color.mist, background: `${color.mist}11` }}
              >
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold transition-colors shadow-md"
                  style={{ background: color.steel, color: "#fff" }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedTopic}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold transition-colors shadow-md disabled:opacity-50"
                  style={{ background: color.teal, color: "#fff" }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------- Delete Confirmation Modal ----------------------------- */}
      <AnimatePresence>
        {showDeleteConfirm && topicToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ring-1"
              style={{ borderColor: `${color.mist}55` }}
            >
              {/* Header */}
              <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ background: "#ef4444" }}
              >
                <h2 className="text-xl font-bold text-white">Delete Topic</h2>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle size={24} className="text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold mb-2" style={{ color: color.deep }}>
                      Are you sure you want to delete this topic?
                    </p>
                    <p className="text-sm" style={{ color: color.steel }}>
                      <strong>{topicToDelete.title}</strong>
                    </p>
                    <p className="text-sm mt-2" style={{ color: color.steel }}>
                      This action cannot be undone. The topic will be permanently removed from the database.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="border-t p-6 flex gap-3"
                style={{ borderColor: color.mist, background: `${color.mist}11` }}
              >
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold transition-colors shadow-md"
                  style={{ background: color.steel, color: "#fff" }}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={deleteTopic}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl font-bold transition-colors shadow-md disabled:opacity-50"
                  style={{ background: "#ef4444", color: "#fff" }}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------- Published Topic View Modal ----------------------------- */}
      <AnimatePresence>
        {showPublishedModal && selectedPublishedTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPublishedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ring-1"
              style={{ borderColor: `${color.mist}55` }}
            >
              {/* Header */}
              <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ background: color.ocean }}
              >
                <h2 className="text-xl font-bold text-white">Published Topic Details</h2>
                <button
                  onClick={() => setShowPublishedModal(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
                {/* Title */}
                <div>
                  <h3 className="font-semibold text-sm mb-2" style={{ color: color.steel }}>
                    Title
                  </h3>
                  <p className="text-xl font-bold" style={{ color: color.deep }}>
                    {selectedPublishedTopic.title}
                  </p>
                </div>

                {/* About */}
                <div>
                  <h3 className="font-semibold text-sm mb-2" style={{ color: color.steel }}>
                    Description
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: color.deep }}>
                    {selectedPublishedTopic.about_refined}
                  </p>
                </div>

                {/* Terms & Explanations */}
                <div>
                  <h3 className="font-semibold text-sm mb-3" style={{ color: color.steel }}>
                    Key Terms & Explanations
                  </h3>
                  <div className="space-y-4">
                    {selectedPublishedTopic.terms_expounded.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border"
                        style={{ borderColor: color.mist, background: `${color.mist}15` }}
                      >
                        <h4
                          className="font-bold text-base mb-2"
                          style={{ color: color.deep }}
                        >
                          {index + 1}. {item.term}
                        </h4>
                        <p className="text-sm leading-relaxed" style={{ color: color.steel }}>
                          {item.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Link */}
                {selectedPublishedTopic.video_image_link && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2" style={{ color: color.steel }}>
                      Media Link
                    </h3>
                    <a
                      href={selectedPublishedTopic.video_image_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                      style={{ color: color.ocean }}
                    >
                      {selectedPublishedTopic.video_image_link}
                    </a>
                  </div>
                )}

                {/* Metadata */}
                <div
                  className="p-4 rounded-lg"
                  style={{ background: `${color.mist}20` }}
                >
                  <p className="text-xs" style={{ color: color.steel }}>
                    <strong>Created by:</strong> {selectedPublishedTopic.creator_full_name || "Unknown"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: color.steel }}>
                    <strong>Published by:</strong> {selectedPublishedTopic.publisher_full_name || "Unknown"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: color.steel }}>
                    <strong>Published:</strong> {new Date(selectedPublishedTopic.published_at).toLocaleString()}
                  </p>
                  <p className="text-xs mt-1" style={{ color: color.steel }}>
                    <strong>Views:</strong> {selectedPublishedTopic.view_count || 0}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div
                className="border-t p-6"
                style={{ borderColor: color.mist, background: `${color.mist}11` }}
              >
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPublishedModal(false)}
                    className="flex-1 py-3 rounded-xl font-semibold transition-colors shadow-sm"
                    style={{ background: color.steel, color: "#fff" }}
                  >
                    Close
                  </button>
                  
                  {isTeacher && (
                    <button
                      onClick={async () => {
                        const confirmUnpublish = window.confirm(
                          `⚠️ WARNING: UNPUBLISH TOPIC\n\n` +
                          `Are you sure you want to unpublish "${selectedPublishedTopic.title}"?\n\n` +
                          `This action will:\n` +
                          `• Permanently delete it from the Published Topics table\n` +
                          `• Make the topic invisible to all students\n` +
                          `• Change status to "unpublished" in teacher_topics\n` +
                          `• Keep it in teacher_topics for future reference\n\n` +
                          `Click OK to confirm unpublishing.`
                        );
                        
                        if (confirmUnpublish) {
                          try {
                            // Step 1: Update teacher_topics - set status to "unpublished" and is_active to false
                            const { error: teacherTopicError } = await supabase
                              .from("teacher_topics")
                              .update({ 
                                status: "unpublished",
                                is_active: false 
                              })
                              .eq("id", selectedPublishedTopic.teacher_topic_id);

                            if (teacherTopicError) {
                              console.error("Error updating teacher_topics:", teacherTopicError);
                              alert(`❌ Failed to update teacher_topics: ${teacherTopicError.message}`);
                              return;
                            }

                            // Step 2: Delete the record from published_topics table
                            const { error: unpublishError } = await supabase
                              .from("published_topics")
                              .delete()
                              .eq("id", selectedPublishedTopic.id);

                            if (unpublishError) {
                              console.error("Error unpublishing topic:", unpublishError);
                              alert(`❌ Failed to unpublish: ${unpublishError.message}`);
                            } else {
                              alert("✅ Topic unpublished successfully!\n\nThe topic has been deleted from the Published Topics table and status changed to 'unpublished' in teacher_topics.");
                              setShowPublishedModal(false);
                              loadPublishedTopics();
                            }
                          } catch (err: any) {
                            console.error("Error unpublishing:", err);
                            alert(`❌ Failed to unpublish: ${err.message}`);
                          }
                        }
                      }}
                      className="flex-1 py-3 rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2"
                      style={{ background: "#f59e0b", color: "#fff" }}
                    >
                      <XCircle size={18} />
                      Unpublish Topic
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
