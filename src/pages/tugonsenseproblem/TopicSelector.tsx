import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, X, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { MathJax } from "better-react-mathjax";

/* ----------------------------- Color Palette (from Teacher Dashboard) ----------------------------- */

const color = {
  teal: "#14b8a6",
  deep: "#0f172a",
  steel: "#64748b",
  mist: "#cbd5e1",
  ocean: "#0ea5e9",
};

/* ----------------------------- Types ----------------------------- */

interface Topic {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface Category {
  id: number;
  topic_id: number;
  category_id: number;
  title: string;
  category_question: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

/* ----------------------------- Component ----------------------------- */

export default function TopicSelector() {
  // @ts-ignore - For future navigation (e.g., to category selector)
  const navigate = useNavigate();
  const { user } = useAuth();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Category state
  const [expandedTopicId, setExpandedTopicId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Record<number, Category[]>>({});
  const [loadingCategories, setLoadingCategories] = useState<Record<number, boolean>>({});

  /* ----------------------------- Load Topics from Supabase ----------------------------- */

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("tugonsense_topics")
        .select("*")
        .order("id", { ascending: true });

      if (fetchError) throw fetchError;

      setTopics(data || []);
    } catch (err: any) {
      console.error("Error loading topics:", err);
      setError(err.message || "Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------- Toggle Selection ----------------------------- */

  const toggleTopicSelection = (id: number) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((topicId) => topicId !== id) : [...prev, id]
    );
  };

  /* ----------------------------- Toggle Topic Expansion & Load Categories ----------------------------- */

  const toggleTopicExpansion = async (topicId: number) => {
    // Toggle expansion
    if (expandedTopicId === topicId) {
      setExpandedTopicId(null);
      return;
    }

    setExpandedTopicId(topicId);

    // Load categories if not already loaded
    if (!categories[topicId]) {
      try {
        setLoadingCategories((prev) => ({ ...prev, [topicId]: true }));

        const { data, error: fetchError } = await supabase
          .from("tugonsense_categories")
          .select("*")
          .eq("topic_id", topicId)
          .order("category_id", { ascending: true });

        if (fetchError) throw fetchError;

        setCategories((prev) => ({ ...prev, [topicId]: data || [] }));
      } catch (err: any) {
        console.error("Error loading categories:", err);
        setError(err.message || "Failed to load categories");
      } finally {
        setLoadingCategories((prev) => ({ ...prev, [topicId]: false }));
      }
    }
  };

  /* ----------------------------- Add Topic to Supabase ----------------------------- */

  const addTopic = async () => {
    if (!modalName.trim()) {
      alert("Please enter a topic name");
      return;
    }

    if (!user?.id) {
      alert("You must be signed in to create topics");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Get the highest existing ID
      const { data: existingTopics, error: fetchError } = await supabase
        .from("tugonsense_topics")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      // Calculate next ID (start with 1 if table is empty)
      const nextId = existingTopics && existingTopics.length > 0 
        ? existingTopics[0].id + 1 
        : 1;

      const { data, error: insertError } = await supabase
        .from("tugonsense_topics")
        .insert({
          id: nextId,
          name: modalName.trim(),
          description: modalDescription.trim() || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Add new topic to local state
      if (data) {
        setTopics((prev) => [...prev, data]);
      }

      // Reset modal
      resetModal();
    } catch (err: any) {
      console.error("Error adding topic:", err);
      alert(err.message || "Failed to add topic");
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- Reset Modal ----------------------------- */

  const resetModal = () => {
    setModalName("");
    setModalDescription("");
    setShowModal(false);
  };

  /* ----------------------------- Remove Topic from Supabase ----------------------------- */

  const removeTopic = async (id: number) => {
    try {
      setSaving(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from("tugonsense_topics")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setTopics((prev) => prev.filter((topic) => topic.id !== id));
      setSelectedTopics((prev) => prev.filter((topicId) => topicId !== id));
    } catch (err: any) {
      console.error("Error deleting topic:", err);
      alert(err.message || "Failed to delete topic");
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- Edit Topic ----------------------------- */

  const openEditModal = (topic: Topic) => {
    setTopicToEdit(topic);
    setEditName(topic.name);
    setEditDescription(topic.description || "");
    setShowEditModal(true);
  };

  const resetEditModal = () => {
    setTopicToEdit(null);
    setEditName("");
    setEditDescription("");
    setShowEditModal(false);
  };

  const updateTopic = async () => {
    if (!editName.trim()) {
      alert("Please enter a topic name");
      return;
    }

    if (!topicToEdit) return;

    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("tugonsense_topics")
        .update({
          name: editName.trim(),
          description: editDescription.trim() || null,
          updated_by: user?.id,
        })
        .eq("id", topicToEdit.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      if (data) {
        setTopics((prev) =>
          prev.map((topic) => (topic.id === topicToEdit.id ? data : topic))
        );
      }

      // Reset modal
      resetEditModal();
    } catch (err: any) {
      console.error("Error updating topic:", err);
      alert(err.message || "Failed to update topic");
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- Delete Confirmation ----------------------------- */

  const confirmDelete = (id: number) => {
    setTopicToDelete(id);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (topicToDelete !== null) {
      await removeTopic(topicToDelete);
      setShowDeleteConfirm(false);
      setTopicToDelete(null);
    }
  };

  /* ----------------------------- Handle Enter Key ----------------------------- */

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTopic();
    }
  };

  /* ----------------------------- Render ----------------------------- */

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
          {/* Header Section - Separated */}
          <div className="mb-4 sm:mb-6">
            <h1 
              className="text-2xl sm:text-3xl font-extrabold mb-2"
              style={{ color: color.deep }}
            >
              Tugonsense Topic Selection
            </h1>
            <p 
              className="text-sm sm:text-base"
              style={{ color: color.steel }}
            >
              Add, edit, and remove Tugonsense Problem Topics!
            </p>
          </div>

          {/* Main Content Card */}
          <div 
            className="rounded-2xl sm:rounded-3xl shadow-xl ring-1"
            style={{ background: "#fff", borderColor: `${color.mist}55` }}
          >
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-50 border-l-4 border-red-500 p-4 m-4 sm:m-6 rounded-lg"
              >
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="p-6 sm:p-8 text-center">
                <motion.div 
                  className="inline-block rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-t-4"
                  style={{ borderColor: `${color.teal}40` }}
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                    borderColor: [`${color.teal}40`, color.teal, `${color.teal}40`],
                  }}
                  transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }}
                />
                <p className="text-sm mt-3" style={{ color: color.steel }}>
                  Loading topics...
                </p>
              </div>
            ) : (
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {topics.length > 0 ? (
                  <AnimatePresence>
                    {topics.map((topic, index) => (
                      <div key={topic.id}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className={`relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border-b cursor-pointer transition-all hover:bg-gray-50/60 ${
                            expandedTopicId === topic.id
                              ? "bg-teal-50/30"
                              : ""
                          }`}
                          style={{
                            borderColor: color.mist,
                          }}
                          onClick={() => toggleTopicExpansion(topic.id)}
                        >
                          {/* Animated Teal Border Effect */}
                          {expandedTopicId === topic.id && (
                            <motion.div
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                              style={{ background: color.teal }}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "100%", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                          )}

                          {/* Number Badge */}
                          <div 
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5 transition-colors ${
                              expandedTopicId === topic.id ? "ring-2 ring-teal-400" : ""
                            }`}
                            style={{ 
                              background: expandedTopicId === topic.id ? color.teal : color.steel,
                              color: "#fff" 
                            }}
                          >
                            {index + 1}
                          </div>

                          {/* Topic Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base" style={{ color: color.deep }}>
                              <MathJax dynamic>{topic.name}</MathJax>
                            </p>
                            {topic.description && (
                              <p className="text-xs sm:text-sm mt-1" style={{ color: color.steel }}>
                                <MathJax dynamic>{topic.description}</MathJax>
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            {/* Edit Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(topic);
                              }}
                              disabled={saving}
                              className="p-2 rounded-lg transition-colors disabled:opacity-50"
                              style={{ 
                                color: color.steel,
                                background: "transparent",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `${color.ocean}15`;
                                e.currentTarget.style.color = color.ocean;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = color.steel;
                              }}
                              title="Edit topic"
                            >
                              <Pencil size={16} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(topic.id);
                              }}
                              disabled={saving}
                              className="p-2 rounded-lg transition-colors disabled:opacity-50"
                              style={{ 
                                color: color.steel,
                                background: "transparent",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#fee";
                                e.currentTarget.style.color = "#ef4444";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = color.steel;
                              }}
                              title="Remove topic"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </motion.div>

                        {/* Categories Dropdown */}
                        <AnimatePresence>
                          {expandedTopicId === topic.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden border-b"
                              style={{ 
                                borderColor: color.mist,
                                background: `${color.teal}05`,
                              }}
                            >
                              <div className="p-4 sm:p-6 pl-12 sm:pl-16">
                                {loadingCategories[topic.id] ? (
                                  <div className="flex items-center gap-2 text-sm" style={{ color: color.steel }}>
                                    <motion.div
                                      className="w-4 h-4 border-2 border-t-2 rounded-full"
                                      style={{ borderColor: `${color.teal}40`, borderTopColor: color.teal }}
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span>Loading Stages...</span>
                                  </div>
                                ) : categories[topic.id] && categories[topic.id].length > 0 ? (
                                  <div className="space-y-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: color.steel }}>
                                      Categories ({categories[topic.id].length})
                                    </h3>
                                    {categories[topic.id].map((category, catIndex) => (
                                      <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, delay: catIndex * 0.05 }}
                                        className="flex items-start gap-3 p-3 rounded-lg border transition-colors hover:shadow-sm"
                                        style={{ 
                                          background: "#fff",
                                          borderColor: color.mist,
                                        }}
                                      >
                                        {/* Category Number */}
                                        <div 
                                          className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0"
                                          style={{ background: `${color.teal}15`, color: color.teal }}
                                        >
                                          {category.category_id}
                                        </div>
                                        
                                        {/* Category Info */}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-sm" style={{ color: color.deep }}>
                                            <MathJax dynamic>{category.title}</MathJax>
                                          </p>
                                          {category.category_question && (
                                            <p className="text-xs mt-1" style={{ color: color.steel }}>
                                              <MathJax dynamic>{category.category_question}</MathJax>
                                            </p>
                                          )}
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4">
                                    <p className="text-sm font-medium" style={{ color: color.steel }}>
                                      No categories yet
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: color.mist }}>
                                      Categories will appear here once added
                                    </p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 sm:py-12"
                  >
                    <p className="font-semibold text-sm sm:text-base" style={{ color: color.steel }}>
                      No topics added yet
                    </p>
                    <p className="text-xs sm:text-sm mt-2" style={{ color: color.mist }}>
                      Click "Add New Topic" to get started
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Add Topic Button */}
            <div 
              className="border-t p-4 sm:p-6"
              style={{ borderColor: color.mist, background: "#fff" }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal(true)}
                disabled={saving}
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 font-semibold rounded-xl text-sm sm:text-base transition-colors shadow-md flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                style={{ background: color.teal, color: "#fff" }}
              >
                <Plus size={20} />
                <span>Add New Topic</span>
              </motion.button>
            </div>
          </div>

          {/* Selected Topics Summary */}
          {selectedTopics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 sm:mt-6 rounded-2xl p-4 sm:p-5 shadow-lg ring-1"
              style={{ 
                background: "#fff", 
                borderColor: `${color.mist}55`,
              }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ background: color.teal }}
                />
                <p className="font-semibold text-sm sm:text-base" style={{ color: color.deep }}>
                  {selectedTopics.length} topic{selectedTopics.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* ----------------------------- Add Topic Modal ----------------------------- */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={resetModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full ring-1"
              style={{ borderColor: `${color.mist}55` }}
            >
              {/* Modal Header */}
              <div 
                className="px-6 py-4 sm:py-5 flex items-center justify-between rounded-t-2xl"
                style={{ background: color.teal }}
              >
                <h2 className="text-lg sm:text-xl font-bold text-white">Add New Topic</h2>
                <button
                  onClick={resetModal}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  disabled={saving}
                  title="Close"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 sm:space-y-5">
                <div>
                  <label 
                    className="block text-xs font-bold uppercase tracking-wide mb-2"
                    style={{ color: color.deep }}
                  >
                    Topic Name *
                  </label>
                  <input
                    type="text"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={saving}
                    className="w-full px-4 py-2.5 sm:py-3 border rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 disabled:bg-gray-100"
                    style={{ 
                      borderColor: color.mist,
                    }}
                    placeholder="Enter topic name (supports LaTeX)..."
                    autoFocus
                  />
                  {modalName.trim() && (
                    <div 
                      className="mt-2 p-3 border rounded-xl text-sm"
                      style={{ background: `${color.mist}11`, borderColor: color.mist }}
                    >
                      <MathJax dynamic>{modalName}</MathJax>
                    </div>
                  )}
                </div>

                <div>
                  <label 
                    className="block text-xs font-bold uppercase tracking-wide mb-2"
                    style={{ color: color.deep }}
                  >
                    Description
                  </label>
                  <textarea
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-2.5 sm:py-3 border rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 resize-none disabled:bg-gray-100"
                    style={{ 
                      borderColor: color.mist,
                    }}
                    placeholder="Enter topic description (supports LaTeX)..."
                    rows={3}
                  />
                  {modalDescription.trim() && (
                    <div 
                      className="mt-2 p-3 border rounded-xl text-sm"
                      style={{ background: `${color.mist}11`, borderColor: color.mist }}
                    >
                      <MathJax dynamic>{modalDescription}</MathJax>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div 
                className="border-t p-6 flex gap-3 rounded-b-2xl"
                style={{ borderColor: color.mist, background: `${color.mist}11` }}
              >
                <button
                  onClick={resetModal}
                  disabled={saving}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 shadow-sm"
                  style={{ background: color.mist, color: color.deep }}
                >
                  Cancel
                </button>
                <button
                  onClick={addTopic}
                  disabled={saving || !modalName.trim()}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 shadow-md"
                  style={{ background: color.teal, color: "#fff" }}
                >
                  {saving ? "Adding..." : "Add Topic"}
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
            onClick={resetEditModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full ring-1"
              style={{ borderColor: `${color.mist}55` }}
            >
              {/* Modal Header */}
              <div 
                className="px-6 py-4 sm:py-5 flex items-center justify-between rounded-t-2xl"
                style={{ background: color.ocean }}
              >
                <h2 className="text-lg sm:text-xl font-bold text-white">Edit Topic</h2>
                <button
                  onClick={resetEditModal}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  disabled={saving}
                  title="Close"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 sm:space-y-5">
                <div>
                  <label 
                    className="block text-xs font-bold uppercase tracking-wide mb-2"
                    style={{ color: color.deep }}
                  >
                    Topic Name *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && updateTopic()}
                    disabled={saving}
                    className="w-full px-4 py-2.5 sm:py-3 border rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 disabled:bg-gray-100"
                    style={{ 
                      borderColor: color.mist,
                    }}
                    placeholder="Enter topic name (supports LaTeX)..."
                    autoFocus
                  />
                </div>

                <div>
                  <label 
                    className="block text-xs font-bold uppercase tracking-wide mb-2"
                    style={{ color: color.deep }}
                  >
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-2.5 sm:py-3 border rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 resize-none disabled:bg-gray-100"
                    style={{ 
                      borderColor: color.mist,
                    }}
                    placeholder="Enter topic description (supports LaTeX)..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div 
                className="border-t p-6 flex gap-3 rounded-b-2xl"
                style={{ borderColor: color.mist, background: `${color.mist}11` }}
              >
                <button
                  onClick={resetEditModal}
                  disabled={saving}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 shadow-sm"
                  style={{ background: color.mist, color: color.deep }}
                >
                  Cancel
                </button>
                <button
                  onClick={updateTopic}
                  disabled={saving || !editName.trim()}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 shadow-md"
                  style={{ background: color.ocean, color: "#fff" }}
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
        {showDeleteConfirm && (
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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full ring-1"
              style={{ borderColor: `${color.mist}55` }}
            >
              {/* Modal Header */}
              <div 
                className="px-6 py-4 sm:py-5 flex items-center justify-between rounded-t-2xl"
                style={{ background: "#ef4444" }}
              >
                <h2 className="text-lg sm:text-xl font-bold text-white">Delete Topic</h2>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={saving}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-3">
                <p className="font-semibold text-sm sm:text-base" style={{ color: color.deep }}>
                  Are you sure you want to delete this topic?
                </p>
                <div 
                  className="p-4 rounded-xl border-l-4"
                  style={{ background: "#fef2f2", borderColor: "#ef4444" }}
                >
                  <p className="text-red-600 font-semibold text-xs sm:text-sm">
                    ⚠️ Warning: If you delete this topic, all associated categories, questions, and
                    answer steps will be permanently deleted due to CASCADE constraints.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div 
                className="border-t p-6 flex gap-3 rounded-b-2xl"
                style={{ borderColor: color.mist, background: `${color.mist}11` }}
              >
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={saving}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 shadow-sm"
                  style={{ background: color.mist, color: color.deep }}
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={saving}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 shadow-md"
                  style={{ background: "#ef4444", color: "#fff" }}
                >
                  {saving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
