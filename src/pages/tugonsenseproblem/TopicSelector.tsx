import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, X, Pencil, FileQuestion, ChevronUp, ChevronDown } from "lucide-react";
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

interface Question {
  id: number;
  topic_id: number;
  category_id: number;
  question_id: number;
  category_text: string | null;
  question_text: string;
  question_type: string;
  guide_text: string | null;
  answer_type: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface AnswerStep {
  id: number;
  topic_id: number;
  category_id: number;
  question_id: number;
  step_order: number;
  label: string;
  answer_variants: string[];
  placeholder: string | null;
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

  // Category add modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [addCategoryTopicId, setAddCategoryTopicId] = useState<number | null>(null);
  const [addCategoryTitle, setAddCategoryTitle] = useState("");
  const [addCategoryQuestion, setAddCategoryQuestion] = useState("");

  // Category edit/delete modal state
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [editCategoryTitle, setEditCategoryTitle] = useState("");
  const [editCategoryQuestion, setEditCategoryQuestion] = useState("");
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Question selector modal state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // Question view/edit/delete modal state
  const [showViewQuestionModal, setShowViewQuestionModal] = useState(false);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [showDeleteQuestionConfirm, setShowDeleteQuestionConfirm] = useState(false);
  const [questionToView, setQuestionToView] = useState<Question | null>(null);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  
  // Add question modal state
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [addQuestionText, setAddQuestionText] = useState("");
  const [addQuestionType, setAddQuestionType] = useState("step-by-step");
  const [addAnswerType, setAddAnswerType] = useState("multiLine");
  const [addCategoryText, setAddCategoryText] = useState("");
  
  // Edit question form state
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editQuestionType, setEditQuestionType] = useState("step-by-step");
  const [editGuideText, setEditGuideText] = useState("");
  const [editAnswerType, setEditAnswerType] = useState("multiLine");
  const [editCategoryText, setEditCategoryText] = useState("");

  // Answer steps state
  const [answerSteps, setAnswerSteps] = useState<AnswerStep[]>([]);
  const [loadingAnswerSteps, setLoadingAnswerSteps] = useState(false);
  const [maxSteps, setMaxSteps] = useState(4);
  const [stepForms, setStepForms] = useState<Array<{
    placeholder: string;
    label: string;
    variants: string[];
  }>>([]);

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

  /* ----------------------------- Category CRUD Functions ----------------------------- */

  const openAddCategoryModal = (topicId: number) => {
    setAddCategoryTopicId(topicId);
    setAddCategoryTitle("");
    setAddCategoryQuestion("");
    setShowAddCategoryModal(true);
  };

  const resetAddCategoryModal = () => {
    setAddCategoryTopicId(null);
    setAddCategoryTitle("");
    setAddCategoryQuestion("");
    setShowAddCategoryModal(false);
  };

  const addCategory = async () => {
    if (!addCategoryTitle.trim()) {
      alert("Please enter a category title");
      return;
    }

    if (!addCategoryTopicId) {
      alert("No topic selected");
      return;
    }

    if (!user?.id) {
      alert("You must be signed in to create categories");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Get the highest category_id for this topic
      const { data: existingCategories, error: fetchError } = await supabase
        .from("tugonsense_categories")
        .select("category_id")
        .eq("topic_id", addCategoryTopicId)
        .order("category_id", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      // Calculate next category_id (start with 1 if no categories exist for this topic)
      const nextCategoryId = existingCategories && existingCategories.length > 0
        ? existingCategories[0].category_id + 1
        : 1;

      const { data, error: insertError } = await supabase
        .from("tugonsense_categories")
        .insert({
          topic_id: addCategoryTopicId,
          category_id: nextCategoryId,
          title: addCategoryTitle.trim(),
          category_question: addCategoryQuestion.trim() || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Add new category to local state
      if (data) {
        setCategories((prev) => ({
          ...prev,
          [addCategoryTopicId]: [...(prev[addCategoryTopicId] || []), data].sort(
            (a, b) => a.category_id - b.category_id
          ),
        }));
      }

      // Reset modal
      resetAddCategoryModal();
    } catch (err: any) {
      console.error("Error adding category:", err);
      alert(err.message || "Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  const openEditCategoryModal = (category: Category) => {
    setCategoryToEdit(category);
    setEditCategoryTitle(category.title);
    setEditCategoryQuestion(category.category_question || "");
    setShowEditCategoryModal(true);
  };

  const resetEditCategoryModal = () => {
    setCategoryToEdit(null);
    setEditCategoryTitle("");
    setEditCategoryQuestion("");
    setShowEditCategoryModal(false);
  };

  const updateCategory = async () => {
    if (!editCategoryTitle.trim()) {
      alert("Please enter a category title");
      return;
    }

    if (!categoryToEdit) return;

    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("tugonsense_categories")
        .update({
          title: editCategoryTitle.trim(),
          category_question: editCategoryQuestion.trim() || null,
          updated_by: user?.id,
        })
        .eq("id", categoryToEdit.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      if (data) {
        setCategories((prev) => ({
          ...prev,
          [categoryToEdit.topic_id]: prev[categoryToEdit.topic_id].map((cat) =>
            cat.id === categoryToEdit.id ? data : cat
          ),
        }));
      }

      // Reset modal
      resetEditCategoryModal();
    } catch (err: any) {
      console.error("Error updating category:", err);
      alert(err.message || "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteCategoryConfirm(true);
  };

  const executeDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setSaving(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from("tugonsense_categories")
        .delete()
        .eq("id", categoryToDelete.id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setCategories((prev) => ({
        ...prev,
        [categoryToDelete.topic_id]: prev[categoryToDelete.topic_id].filter(
          (cat) => cat.id !== categoryToDelete.id
        ),
      }));

      setShowDeleteCategoryConfirm(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      console.error("Error deleting category:", err);
      alert(err.message || "Failed to delete category");
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- Question CRUD Functions ----------------------------- */

  const openQuestionModal = async (category: Category) => {
    setSelectedCategory(category);
    setShowQuestionModal(true);
    await loadQuestions(category.topic_id, category.category_id);
  };

  const resetQuestionModal = () => {
    setSelectedCategory(null);
    setQuestions([]);
    setShowQuestionModal(false);
  };

  const loadQuestions = async (topicId: number, categoryId: number) => {
    try {
      setLoadingQuestions(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("tugonsense_questions")
        .select("*")
        .eq("topic_id", topicId)
        .eq("category_id", categoryId)
        .order("question_id", { ascending: true });

      if (fetchError) throw fetchError;

      setQuestions(data || []);
    } catch (err: any) {
      console.error("Error loading questions:", err);
      setError(err.message || "Failed to load questions");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const openViewQuestionModal = (question: Question) => {
    setQuestionToView(question);
    setShowViewQuestionModal(true);
  };

  const resetViewQuestionModal = () => {
    setQuestionToView(null);
    setShowViewQuestionModal(false);
  };

  const openEditQuestionModal = async (question: Question) => {
    setQuestionToEdit(question);
    setEditQuestionText(question.question_text);
    setEditQuestionType(question.question_type || "step-by-step");
    setEditGuideText(question.guide_text || "");
    setEditAnswerType(question.answer_type || "multiLine");
    setEditCategoryText(question.category_text || "");
    setShowEditQuestionModal(true);
    
    // Load answer steps for this question
    await loadAnswerSteps(question.topic_id, question.category_id, question.question_id);
  };

  const resetEditQuestionModal = () => {
    setQuestionToEdit(null);
    setEditQuestionText("");
    setEditQuestionType("step-by-step");
    setEditGuideText("");
    setEditAnswerType("multiLine");
    setEditCategoryText("");
    setAnswerSteps([]);
    setStepForms([]);
    setMaxSteps(4);
    setShowEditQuestionModal(false);
  };

  const updateQuestion = async () => {
    if (!editQuestionText.trim()) {
      alert("Please enter question text");
      return;
    }

    if (!questionToEdit) return;

    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("tugonsense_questions")
        .update({
          question_text: editQuestionText.trim(),
          question_type: editQuestionType,
          guide_text: editGuideText.trim() || null,
          answer_type: editAnswerType || "multiLine",
          category_text: editCategoryText.trim() || null,
          updated_by: user?.id,
        })
        .eq("id", questionToEdit.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      if (data) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionToEdit.id ? data : q))
        );
      }

      // Reset modal
      resetEditQuestionModal();
    } catch (err: any) {
      console.error("Error updating question:", err);
      alert(err.message || "Failed to update question");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteQuestion = (question: Question) => {
    setQuestionToDelete(question);
    setShowDeleteQuestionConfirm(true);
  };

  const executeDeleteQuestion = async () => {
    if (!questionToDelete) return;

    try {
      setSaving(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from("tugonsense_questions")
        .delete()
        .eq("id", questionToDelete.id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete.id));

      setShowDeleteQuestionConfirm(false);
      setQuestionToDelete(null);
    } catch (err: any) {
      console.error("Error deleting question:", err);
      alert(err.message || "Failed to delete question");
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- Add Question Functions ----------------------------- */

  const openAddQuestionModal = () => {
    setAddQuestionText("");
    setAddQuestionType("step-by-step");
    setAddAnswerType("multiLine");
    setAddCategoryText("");
    setStepForms([]);
    setMaxSteps(4);
    setShowAddQuestionModal(true);
  };

  const resetAddQuestionModal = () => {
    setAddQuestionText("");
    setAddQuestionType("step-by-step");
    setAddAnswerType("multiLine");
    setAddCategoryText("");
    setStepForms([]);
    setMaxSteps(4);
    setShowAddQuestionModal(false);
  };

  const addQuestion = async () => {
    if (!addQuestionText.trim()) {
      alert("Please enter question text");
      return;
    }

    if (!selectedCategory) {
      alert("No category selected");
      return;
    }

    if (!user?.id) {
      alert("You must be signed in to create questions");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Get the highest question_id for this category
      const { data: existingQuestions, error: fetchError } = await supabase
        .from("tugonsense_questions")
        .select("question_id")
        .eq("topic_id", selectedCategory.topic_id)
        .eq("category_id", selectedCategory.category_id)
        .order("question_id", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      // Calculate next question_id
      const nextQuestionId = existingQuestions && existingQuestions.length > 0
        ? existingQuestions[0].question_id + 1
        : 1;

      // Insert new question
      const { data: newQuestion, error: insertError } = await supabase
        .from("tugonsense_questions")
        .insert({
          topic_id: selectedCategory.topic_id,
          category_id: selectedCategory.category_id,
          question_id: nextQuestionId,
          question_text: addQuestionText.trim(),
          question_type: addQuestionType,
          answer_type: addAnswerType,
          category_text: addCategoryText.trim() || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Add answer steps if forms are populated
      if (newQuestion && stepForms.length > 0) {
        const stepsToInsert = stepForms.map((form, index) => ({
          topic_id: selectedCategory.topic_id,
          category_id: selectedCategory.category_id,
          question_id: nextQuestionId,
          step_order: index + 1,
          label: form.label,
          answer_variants: form.variants.filter(v => v.trim() !== ""),
          placeholder: form.placeholder.trim() ? `\\text{${form.placeholder.trim()}}` : null,
          created_by: user.id
        }));

        const { error: stepsError } = await supabase
          .from("tugonsense_answer_steps")
          .insert(stepsToInsert);

        if (stepsError) throw stepsError;
      }

      // Add to local state
      if (newQuestion) {
        setQuestions((prev) => [...prev, newQuestion].sort((a, b) => a.question_id - b.question_id));
      }

      // Reset modal
      resetAddQuestionModal();
      alert("Question added successfully!");
    } catch (err: any) {
      console.error("Error adding question:", err);
      alert(err.message || "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- Answer Steps Functions ----------------------------- */

  const loadAnswerSteps = async (topicId: number, categoryId: number, questionId: number) => {
    try {
      setLoadingAnswerSteps(true);

      const { data, error: fetchError } = await supabase
        .from("tugonsense_answer_steps")
        .select("*")
        .eq("topic_id", topicId)
        .eq("category_id", categoryId)
        .eq("question_id", questionId)
        .order("step_order", { ascending: true });

      if (fetchError) throw fetchError;

      setAnswerSteps(data || []);
      
      // Initialize step forms if steps exist
      if (data && data.length > 0) {
        setMaxSteps(data.length);
        setStepForms(data.map(step => {
          // Unwrap \text{} from placeholder when loading for editing
          let unwrappedPlaceholder = step.placeholder || "";
          if (unwrappedPlaceholder) {
            // Remove \text{ from start and } from end if present
            const textMatch = unwrappedPlaceholder.match(/^\\text\{(.*)\}$/);
            if (textMatch) {
              unwrappedPlaceholder = textMatch[1];
            }
          }
          
          return {
            placeholder: unwrappedPlaceholder,
            label: step.label,
            variants: step.answer_variants
          };
        }));
      }
    } catch (err: any) {
      console.error("Error loading answer steps:", err);
    } finally {
      setLoadingAnswerSteps(false);
    }
  };

  const initializeSteps = () => {
    const numSteps = Math.min(Math.max(1, maxSteps), 10);
    
    // If steps already exist, adjust the count
    if (stepForms.length > 0) {
      if (numSteps > stepForms.length) {
        // Add more steps
        const additionalSteps = Array.from({ length: numSteps - stepForms.length }, () => ({
          placeholder: "",
          label: "substitution",
          variants: [""]
        }));
        setStepForms([...stepForms, ...additionalSteps]);
      } else if (numSteps < stepForms.length) {
        // Remove excess steps
        setStepForms(stepForms.slice(0, numSteps));
      }
    } else {
      // Create new steps from scratch
      const newForms = Array.from({ length: numSteps }, () => ({
        placeholder: "",
        label: "substitution",
        variants: [""]
      }));
      setStepForms(newForms);
    }
  };

  const updateStepForm = (index: number, field: keyof typeof stepForms[0], value: any) => {
    setStepForms(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addVariant = (stepIndex: number) => {
    setStepForms(prev => {
      const updated = [...prev];
      if (updated[stepIndex].variants.length < 5) {
        updated[stepIndex] = {
          ...updated[stepIndex],
          variants: [...updated[stepIndex].variants, ""]
        };
      }
      return updated;
    });
  };

  const updateVariant = (stepIndex: number, variantIndex: number, value: string) => {
    setStepForms(prev => {
      const updated = [...prev];
      updated[stepIndex].variants[variantIndex] = value;
      return updated;
    });
  };

  const removeVariant = (stepIndex: number, variantIndex: number) => {
    setStepForms(prev => {
      const updated = [...prev];
      if (updated[stepIndex].variants.length > 1) {
        updated[stepIndex].variants.splice(variantIndex, 1);
      }
      return updated;
    });
  };

  const saveQuestionAndSteps = async () => {
    if (!editQuestionText.trim()) {
      alert("Please enter question text");
      return;
    }

    if (!questionToEdit) return;

    try {
      setSaving(true);
      setError(null);

      // Update question
      const { data: questionData, error: updateError } = await supabase
        .from("tugonsense_questions")
        .update({
          question_text: editQuestionText.trim(),
          question_type: editQuestionType,
          answer_type: editAnswerType || "multiLine",
          category_text: editCategoryText.trim() || null,
          updated_by: user?.id,
        })
        .eq("id", questionToEdit.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local question state
      if (questionData) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionToEdit.id ? questionData : q))
        );
      }

      // Save answer steps if forms are populated
      if (stepForms.length > 0) {
        // Delete existing steps
        await supabase
          .from("tugonsense_answer_steps")
          .delete()
          .eq("topic_id", questionToEdit.topic_id)
          .eq("category_id", questionToEdit.category_id)
          .eq("question_id", questionToEdit.question_id);

        // Insert new steps
        const stepsToInsert = stepForms.map((form, index) => ({
          topic_id: questionToEdit.topic_id,
          category_id: questionToEdit.category_id,
          question_id: questionToEdit.question_id,
          step_order: index + 1,
          label: form.label,
          answer_variants: form.variants.filter(v => v.trim() !== ""),
          placeholder: form.placeholder.trim() ? `\\text{${form.placeholder.trim()}}` : null,
          created_by: user?.id
        }));

        const { error: stepsError } = await supabase
          .from("tugonsense_answer_steps")
          .insert(stepsToInsert);

        if (stepsError) throw stepsError;
      }

      // Reset modal
      resetEditQuestionModal();
      alert("Question and steps saved successfully!");
    } catch (err: any) {
      console.error("Error saving question and steps:", err);
      alert(err.message || "Failed to save question and steps");
    } finally {
      setSaving(false);
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
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Edit Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(topic);
                              }}
                              disabled={saving}
                              className="p-3 rounded-lg transition-all disabled:opacity-50 border-2 border-transparent hover:border-current"
                              style={{ 
                                color: color.ocean,
                                background: `${color.ocean}10`,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `${color.ocean}20`;
                                e.currentTarget.style.borderColor = color.ocean;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = `${color.ocean}10`;
                                e.currentTarget.style.borderColor = "transparent";
                              }}
                              title="Edit topic"
                            >
                              <Pencil size={22} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(topic.id);
                              }}
                              disabled={saving}
                              className="p-3 rounded-lg transition-all disabled:opacity-50 border-2 border-transparent hover:border-current"
                              style={{ 
                                color: "#ef4444",
                                background: "#fee",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#fdd";
                                e.currentTarget.style.borderColor = "#ef4444";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#fee";
                                e.currentTarget.style.borderColor = "transparent";
                              }}
                              title="Remove topic"
                            >
                              <Trash2 size={22} />
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
                                    <div className="flex items-center justify-between mb-3">
                                      <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: color.steel }}>
                                        Categories ({categories[topic.id].length})
                                      </h3>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openAddCategoryModal(topic.id);
                                        }}
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 border-transparent hover:border-current"
                                        style={{
                                          color: color.teal,
                                          background: `${color.teal}15`,
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = `${color.teal}25`;
                                          e.currentTarget.style.borderColor = color.teal;
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = `${color.teal}15`;
                                          e.currentTarget.style.borderColor = "transparent";
                                        }}
                                        title="Add new category"
                                      >
                                        <Plus size={14} />
                                        Add Category
                                      </button>
                                    </div>
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

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {/* Add Question Button */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openQuestionModal(category);
                                            }}
                                            disabled={saving}
                                            className="p-2.5 rounded-lg transition-all disabled:opacity-50 border-2 border-transparent hover:border-current"
                                            style={{ 
                                              color: color.teal,
                                              background: `${color.teal}15`,
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.background = `${color.teal}25`;
                                              e.currentTarget.style.borderColor = color.teal;
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.background = `${color.teal}15`;
                                              e.currentTarget.style.borderColor = "transparent";
                                            }}
                                            title="View questions"
                                          >
                                            <FileQuestion size={20} />
                                          </button>

                                          {/* Edit Category Button */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openEditCategoryModal(category);
                                            }}
                                            disabled={saving}
                                            className="p-2.5 rounded-lg transition-all disabled:opacity-50 border-2 border-transparent hover:border-current"
                                            style={{ 
                                              color: color.ocean,
                                              background: `${color.ocean}15`,
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.background = `${color.ocean}25`;
                                              e.currentTarget.style.borderColor = color.ocean;
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.background = `${color.ocean}15`;
                                              e.currentTarget.style.borderColor = "transparent";
                                            }}
                                            title="Edit category"
                                          >
                                            <Pencil size={20} />
                                          </button>

                                          {/* Delete Category Button */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              confirmDeleteCategory(category);
                                            }}
                                            disabled={saving}
                                            className="p-2.5 rounded-lg transition-all disabled:opacity-50 border-2 border-transparent hover:border-current"
                                            style={{ 
                                              color: "#ef4444",
                                              background: "#fee",
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.background = "#fdd";
                                              e.currentTarget.style.borderColor = "#ef4444";
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.background = "#fee";
                                              e.currentTarget.style.borderColor = "transparent";
                                            }}
                                            title="Delete category"
                                          >
                                            <Trash2 size={20} />
                                          </button>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4">
                                    <p className="text-sm font-medium" style={{ color: color.steel }}>
                                      No categories yet
                                    </p>
                                    <p className="text-xs mt-1 mb-3" style={{ color: color.mist }}>
                                      Categories will appear here once added
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openAddCategoryModal(topic.id);
                                      }}
                                      disabled={saving}
                                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 border-transparent hover:border-current"
                                      style={{
                                        color: color.teal,
                                        background: `${color.teal}15`,
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = `${color.teal}25`;
                                        e.currentTarget.style.borderColor = color.teal;
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = `${color.teal}15`;
                                        e.currentTarget.style.borderColor = "transparent";
                                      }}
                                      title="Add new category"
                                    >
                                      <Plus size={16} />
                                      Add First Category
                                    </button>
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

      {/* ----------------------------- Add Category Modal ----------------------------- */}
      <AnimatePresence>
        {showAddCategoryModal && addCategoryTopicId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={resetAddCategoryModal}
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
                <h2 className="text-lg sm:text-xl font-bold text-white">Add Category</h2>
                <button
                  onClick={resetAddCategoryModal}
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
                    Category Title *
                  </label>
                  <input
                    type="text"
                    value={addCategoryTitle}
                    onChange={(e) => setAddCategoryTitle(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCategory()}
                    disabled={saving}
                    className="w-full px-4 py-2.5 sm:py-3 border rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 disabled:bg-gray-100"
                    style={{ 
                      borderColor: color.mist,
                    }}
                    placeholder="Enter category title (supports LaTeX)..."
                    autoFocus
                  />
                </div>

                <div>
                  <label 
                    className="block text-xs font-bold uppercase tracking-wide mb-2"
                    style={{ color: color.deep }}
                  >
                    Category Question
                  </label>
                  <textarea
                    value={addCategoryQuestion}
                    onChange={(e) => setAddCategoryQuestion(e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-2.5 sm:py-3 border rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 resize-none disabled:bg-gray-100"
                    style={{ 
                      borderColor: color.mist,
                    }}
                    placeholder="Enter category question (supports LaTeX)..."
                    rows={3}
                  />
                </div>

                {/* LaTeX Preview */}
                <div className="border rounded-xl p-4" style={{ borderColor: color.mist, background: `${color.teal}05` }}>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: color.steel }}>
                    Preview
                  </p>
                  {addCategoryTitle.trim() || addCategoryQuestion.trim() ? (
                    <div>
                      {addCategoryTitle.trim() && (
                        <p className="font-medium text-sm mb-2" style={{ color: color.deep }}>
                          <MathJax dynamic>{addCategoryTitle}</MathJax>
                        </p>
                      )}
                      {addCategoryQuestion.trim() && (
                        <p className="text-xs" style={{ color: color.steel }}>
                          <MathJax dynamic>{addCategoryQuestion}</MathJax>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs italic" style={{ color: color.mist }}>
                      Your category preview will appear here...
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div 
                className="border-t p-6 flex gap-3 rounded-b-2xl"
                style={{ borderColor: color.mist, background: `${color.mist}11` }}
              >
                <button
                  onClick={resetAddCategoryModal}
                  disabled={saving}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 shadow-sm"
                  style={{ background: color.mist, color: color.deep }}
                >
                  Cancel
                </button>
                <button
                  onClick={addCategory}
                  disabled={saving || !addCategoryTitle.trim()}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 shadow-md"
                  style={{ background: color.teal, color: "#fff" }}
                >
                  {saving ? "Adding..." : "Add Category"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------- Edit Category Modal ----------------------------- */}
      <AnimatePresence>
        {showEditCategoryModal && categoryToEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={resetEditCategoryModal}
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
                <h2 className="text-lg sm:text-xl font-bold text-white">Edit Category</h2>
                <button
                  onClick={resetEditCategoryModal}
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
                    Category Title *
                  </label>
                  <input
                    type="text"
                    value={editCategoryTitle}
                    onChange={(e) => setEditCategoryTitle(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && updateCategory()}
                    disabled={saving}
                    className="w-full px-4 py-2.5 sm:py-3 border rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 disabled:bg-gray-100"
                    style={{ 
                      borderColor: color.mist,
                    }}
                    placeholder="Enter category title (supports LaTeX)..."
                    autoFocus
                  />
                </div>

                <div>
                  <label 
                    className="block text-xs font-bold uppercase tracking-wide mb-2"
                    style={{ color: color.deep }}
                  >
                    Category Question
                  </label>
                  <textarea
                    value={editCategoryQuestion}
                    onChange={(e) => setEditCategoryQuestion(e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-2.5 sm:py-3 border rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 resize-none disabled:bg-gray-100"
                    style={{ 
                      borderColor: color.mist,
                    }}
                    placeholder="Enter category question (supports LaTeX)..."
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
                  onClick={resetEditCategoryModal}
                  disabled={saving}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 shadow-sm"
                  style={{ background: color.mist, color: color.deep }}
                >
                  Cancel
                </button>
                <button
                  onClick={updateCategory}
                  disabled={saving || !editCategoryTitle.trim()}
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

      {/* ----------------------------- Delete Category Confirmation Modal ----------------------------- */}
      <AnimatePresence>
        {showDeleteCategoryConfirm && categoryToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteCategoryConfirm(false)}
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
                <h2 className="text-lg sm:text-xl font-bold text-white">Delete Category</h2>
                <button
                  onClick={() => setShowDeleteCategoryConfirm(false)}
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
                  Are you sure you want to delete this category?
                </p>
                <div className="p-3 rounded-lg" style={{ background: `${color.mist}11` }}>
                  <p className="font-medium text-sm" style={{ color: color.deep }}>
                    <MathJax dynamic>{categoryToDelete.title}</MathJax>
                  </p>
                  {categoryToDelete.category_question && (
                    <p className="text-xs mt-1" style={{ color: color.steel }}>
                      <MathJax dynamic>{categoryToDelete.category_question}</MathJax>
                    </p>
                  )}
                </div>
                <div 
                  className="p-4 rounded-xl border-l-4"
                  style={{ background: "#fef2f2", borderColor: "#ef4444" }}
                >
                  <p className="text-red-600 font-semibold text-xs sm:text-sm">
                    ⚠️ Warning: If you delete this category, all associated questions and
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
                  onClick={() => setShowDeleteCategoryConfirm(false)}
                  disabled={saving}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 shadow-sm"
                  style={{ background: color.mist, color: color.deep }}
                >
                  Cancel
                </button>
                <button
                  onClick={executeDeleteCategory}
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

      {/* ----------------------------- Question Selector Modal ----------------------------- */}
      <AnimatePresence>
        {showQuestionModal && selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={resetQuestionModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden ring-1"
              style={{ borderColor: `${color.mist}55` }}
            >
              {/* Modal Header */}
              <div 
                className="px-6 py-4 sm:py-5 flex items-center justify-between"
                style={{ background: color.teal }}
              >
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Questions</h2>
                  <p className="text-sm text-white/80 mt-0.5">
                    <MathJax dynamic>{selectedCategory.title}</MathJax>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddQuestionModal();
                    }}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 border-white/30 hover:border-white hover:bg-white/10"
                    style={{ color: "white" }}
                    title="Add new question"
                  >
                    <Plus size={16} />
                    Add Question
                  </button>
                  <button
                    onClick={resetQuestionModal}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    disabled={saving}
                    title="Close"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                {loadingQuestions ? (
                  <div className="flex items-center justify-center py-12">
                    <motion.div
                      className="w-10 h-10 border-4 border-t-4 rounded-full"
                      style={{ borderColor: `${color.teal}40`, borderTopColor: color.teal }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="ml-3 text-sm" style={{ color: color.steel }}>
                      Loading questions...
                    </span>
                  </div>
                ) : questions.length > 0 ? (
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="flex items-start gap-3 p-4 rounded-lg border transition-colors hover:shadow-md"
                        style={{ 
                          background: "#fff",
                          borderColor: color.mist,
                        }}
                      >
                        {/* Question Number */}
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
                          style={{ background: `${color.teal}15`, color: color.teal }}
                        >
                          {question.question_id}
                        </div>
                        
                        {/* Question Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2">
                            <span 
                              className="px-2 py-0.5 rounded text-xs font-medium"
                              style={{ background: `${color.ocean}15`, color: color.ocean }}
                            >
                              {question.question_type}
                            </span>
                            {question.answer_type && (
                              <span 
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{ background: `${color.steel}15`, color: color.steel }}
                              >
                                {question.answer_type}
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-sm mb-1" style={{ color: color.deep }}>
                            <MathJax dynamic>{question.question_text}</MathJax>
                          </p>
                          {question.category_text && (
                            <p className="text-xs mb-1" style={{ color: color.steel }}>
                              <MathJax dynamic>{question.category_text}</MathJax>
                            </p>
                          )}
                          {question.guide_text && (
                            <p className="text-xs italic" style={{ color: color.mist }}>
                              Guide: <MathJax dynamic>{question.guide_text}</MathJax>
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Edit Question Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditQuestionModal(question);
                            }}
                            disabled={saving}
                            className="p-2.5 rounded-lg transition-all disabled:opacity-50 border-2 border-transparent hover:border-current"
                            style={{ 
                              color: color.ocean,
                              background: `${color.ocean}15`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `${color.ocean}25`;
                              e.currentTarget.style.borderColor = color.ocean;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = `${color.ocean}15`;
                              e.currentTarget.style.borderColor = "transparent";
                            }}
                            title="Edit question"
                          >
                            <Pencil size={20} />
                          </button>

                          {/* Delete Question Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteQuestion(question);
                            }}
                            disabled={saving}
                            className="p-2.5 rounded-lg transition-all disabled:opacity-50 border-2 border-transparent hover:border-current"
                            style={{ 
                              color: "#ef4444",
                              background: "#fee",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#fdd";
                              e.currentTarget.style.borderColor = "#ef4444";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#fee";
                              e.currentTarget.style.borderColor = "transparent";
                            }}
                            title="Delete question"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileQuestion size={48} className="mx-auto mb-3" style={{ color: color.mist }} />
                    <p className="text-sm font-medium" style={{ color: color.steel }}>
                      No questions yet
                    </p>
                    <p className="text-xs mt-1" style={{ color: color.mist }}>
                      Questions for this category will appear here
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------- View Question Modal ----------------------------- */}
      <AnimatePresence>
        {showViewQuestionModal && questionToView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
            onClick={resetViewQuestionModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full ring-1"
              style={{ borderColor: `${color.mist}55` }}
            >
              {/* Modal Header */}
              <div 
                className="px-6 py-4 sm:py-5 flex items-center justify-between rounded-t-2xl"
                style={{ background: color.steel }}
              >
                <h2 className="text-lg sm:text-xl font-bold text-white">View Question</h2>
                <button
                  onClick={resetViewQuestionModal}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <span 
                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: `${color.teal}15`, color: color.teal }}
                  >
                    Question #{questionToView.question_id}
                  </span>
                  <span 
                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: `${color.ocean}15`, color: color.ocean }}
                  >
                    {questionToView.question_type}
                  </span>
                  {questionToView.answer_type && (
                    <span 
                      className="px-3 py-1 rounded-lg text-xs font-semibold"
                      style={{ background: `${color.steel}15`, color: color.steel }}
                    >
                      {questionToView.answer_type}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: color.deep }}>
                    Question Text
                  </label>
                  <div className="p-4 rounded-xl border" style={{ borderColor: color.mist, background: `${color.teal}05` }}>
                    <MathJax dynamic>{questionToView.question_text}</MathJax>
                  </div>
                </div>

                {questionToView.category_text && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: color.deep }}>
                      Category Text
                    </label>
                    <div className="p-4 rounded-xl border" style={{ borderColor: color.mist, background: `${color.ocean}05` }}>
                      <MathJax dynamic>{questionToView.category_text}</MathJax>
                    </div>
                  </div>
                )}

                {questionToView.guide_text && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: color.deep }}>
                      Guide Text
                    </label>
                    <div className="p-4 rounded-xl border" style={{ borderColor: color.mist, background: `${color.steel}05` }}>
                      <MathJax dynamic>{questionToView.guide_text}</MathJax>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div 
                className="border-t p-6 rounded-b-2xl"
                style={{ borderColor: color.mist, background: `${color.mist}11` }}
              >
                <button
                  onClick={resetViewQuestionModal}
                  className="w-full py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors shadow-sm"
                  style={{ background: color.steel, color: "#fff" }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------- Edit Question Modal ----------------------------- */}
      <AnimatePresence>
        {showEditQuestionModal && questionToEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
            onClick={(e) => {
              // Only close if clicking on backdrop
              if (e.target === e.currentTarget) {
                resetEditQuestionModal();
              }
            }}
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
              {/* Modal Header */}
              <div 
                className="px-6 py-4 flex items-center justify-between"
                style={{ background: color.ocean }}
              >
                <h2 className="text-xl font-bold text-white">Edit Question</h2>
                <button
                  onClick={resetEditQuestionModal}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  disabled={saving}
                  title="Close"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
                <div className="p-6 space-y-6">
                  {/* Question Fields */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: color.teal }}>
                      Question Details
                    </h3>
                    
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: color.deep }}>
                        Question Text *
                      </label>
                      <textarea
                        value={editQuestionText}
                        onChange={(e) => setEditQuestionText(e.target.value)}
                        disabled={saving}
                        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 resize-none disabled:bg-gray-100"
                        style={{ borderColor: color.mist }}
                        placeholder="Enter question text (supports LaTeX)..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: color.deep }}>
                        Category Text
                      </label>
                      <input
                        type="text"
                        value={editCategoryText}
                        onChange={(e) => setEditCategoryText(e.target.value)}
                        disabled={saving}
                        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 disabled:bg-gray-100"
                        style={{ borderColor: color.mist }}
                        placeholder="Enter category text (optional)..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: color.deep }}>
                          Question Type *
                        </label>
                        <select
                          value={editQuestionType}
                          onChange={(e) => setEditQuestionType(e.target.value)}
                          disabled={saving}
                          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white disabled:bg-gray-100"
                          style={{ borderColor: color.mist }}
                        >
                          <option value="step-by-step">step-by-step</option>
                          <option value="multiple-choice">multiple-choice</option>
                          <option value="true-false">true-false</option>
                          <option value="fill-in-blank">fill-in-blank</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: color.deep }}>
                          Answer Type
                        </label>
                        <select
                          value={editAnswerType}
                          onChange={(e) => setEditAnswerType(e.target.value)}
                          disabled={saving}
                          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white disabled:bg-gray-100"
                          style={{ borderColor: color.mist }}
                        >
                          <option value="multiLine">Multi Line</option>
                          <option value="singleLine">Single Line</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Answer Steps Section */}
                  <div className="border-t pt-6" style={{ borderColor: color.mist }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: color.teal }}>
                        Answer Steps
                      </h3>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold uppercase" style={{ color: color.steel }}>
                          Steps (Max 10):
                        </label>
                        <div className="flex items-center gap-1">
                          {/* Decrement Button */}
                          <button
                            onClick={() => setMaxSteps(prev => Math.max(1, prev - 1))}
                            disabled={saving || maxSteps <= 1}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                            style={{ borderColor: color.mist, color: color.steel }}
                            title="Decrease steps"
                          >
                            <ChevronDown size={16} />
                          </button>
                          
                          {/* Number Input */}
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={maxSteps}
                            onChange={(e) => setMaxSteps(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                            disabled={saving}
                            className="w-14 px-2 py-1 border-2 rounded-lg text-sm text-center font-semibold disabled:bg-gray-50"
                            style={{ borderColor: color.mist, color: color.deep }}
                          />
                          
                          {/* Increment Button */}
                          <button
                            onClick={() => setMaxSteps(prev => Math.min(10, prev + 1))}
                            disabled={saving || maxSteps >= 10}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                            style={{ borderColor: color.mist, color: color.steel }}
                            title="Increase steps"
                          >
                            <ChevronUp size={16} />
                          </button>
                        </div>
                        
                        <button
                          onClick={initializeSteps}
                          disabled={saving}
                          className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          style={{ background: color.teal, color: "white" }}
                        >
                          Submit Steps
                        </button>
                      </div>
                    </div>

                    {/* Steps Forms */}
                    {stepForms.length > 0 && (
                      <div className="space-y-4">
                        {stepForms.map((form, stepIndex) => (
                          <div
                            key={stepIndex}
                            className="p-4 rounded-xl border"
                            style={{ borderColor: color.mist, background: `${color.teal}05` }}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                                style={{ background: color.teal, color: "white" }}
                              >
                                {stepIndex + 1}
                              </div>
                              <span className="text-xs font-bold uppercase" style={{ color: color.teal }}>
                                STEP {stepIndex + 1}
                              </span>
                            </div>

                            <div className="space-y-3">
                              {/* Direction (Placeholder) */}
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: color.deep }}>
                                  Direction
                                </label>
                                <input
                                  type="text"
                                  value={form.placeholder}
                                  onChange={(e) => updateStepForm(stepIndex, "placeholder", e.target.value)}
                                  disabled={saving}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                  style={{ borderColor: color.mist }}
                                  placeholder="Enter direction (will be wrapped in \\text{})"
                                />
                              </div>

                              {/* Label */}
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: color.deep }}>
                                  Label
                                </label>
                                <select
                                  value={form.label}
                                  onChange={(e) => updateStepForm(stepIndex, "label", e.target.value)}
                                  disabled={saving}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                  style={{ borderColor: color.mist }}
                                >
                                  <option value="substitution">substitution</option>
                                  <option value="evaluation">evaluation</option>
                                  <option value="simplification">simplification</option>
                                  <option value="final">final</option>
                                </select>
                              </div>

                              {/* Answer Variants */}
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: color.deep }}>
                                  Answer Variants
                                </label>
                                <div className="space-y-2">
                                  {form.variants.map((variant, variantIndex) => (
                                    <div key={variantIndex} className="flex gap-2">
                                      <input
                                        type="text"
                                        value={variant}
                                        onChange={(e) => updateVariant(stepIndex, variantIndex, e.target.value)}
                                        disabled={saving}
                                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                        style={{ borderColor: color.mist }}
                                        placeholder={`Variant ${variantIndex + 1}`}
                                      />
                                      {form.variants.length > 1 && (
                                        <button
                                          onClick={() => removeVariant(stepIndex, variantIndex)}
                                          disabled={saving}
                                          className="px-2 py-2 rounded-lg transition-colors"
                                          style={{ background: "#fee", color: "#ef4444" }}
                                          title="Remove variant"
                                        >
                                          <X size={16} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  {form.variants.length < 5 && (
                                    <button
                                      onClick={() => addVariant(stepIndex)}
                                      disabled={saving}
                                      className="w-full px-3 py-2 border-2 border-dashed rounded-lg text-xs font-medium transition-colors"
                                      style={{ borderColor: color.teal, color: color.teal }}
                                    >
                                      + Add Variant
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {loadingAnswerSteps && (
                      <div className="text-center py-8">
                        <div className="inline-block w-8 h-8 border-4 border-t-4 rounded-full animate-spin" style={{ borderColor: `${color.teal}40`, borderTopColor: color.teal }} />
                        <p className="text-sm mt-2" style={{ color: color.steel }}>Loading answer steps...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div 
                className="border-t p-6 flex gap-3"
                style={{ borderColor: color.mist, background: `${color.mist}11` }}
              >
                <button
                  onClick={resetEditQuestionModal}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm"
                  style={{ background: color.mist, color: color.deep }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveQuestionAndSteps}
                  disabled={saving || !editQuestionText.trim()}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 shadow-md"
                  style={{ background: color.ocean, color: "#fff" }}
                >
                  {saving ? "Saving..." : "Save Question & Steps"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------- Delete Question Confirmation Modal ----------------------------- */}
      <AnimatePresence>
        {showDeleteQuestionConfirm && questionToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
            onClick={() => setShowDeleteQuestionConfirm(false)}
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
                <h2 className="text-lg sm:text-xl font-bold text-white">Delete Question</h2>
                <button
                  onClick={() => setShowDeleteQuestionConfirm(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  disabled={saving}
                  title="Close"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-3">
                <p className="text-sm" style={{ color: color.deep }}>
                  Are you sure you want to delete this question?
                </p>
                
                <div className="p-4 rounded-xl border bg-gray-50" style={{ borderColor: color.mist }}>
                  <div className="flex gap-2 mb-2">
                    <span 
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: `${color.teal}15`, color: color.teal }}
                    >
                      Question #{questionToDelete.question_id}
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: `${color.ocean}15`, color: color.ocean }}
                    >
                      {questionToDelete.question_type}
                    </span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: color.deep }}>
                    <MathJax dynamic>{questionToDelete.question_text}</MathJax>
                  </p>
                </div>

                <div className="p-4 rounded-xl border-l-4 bg-red-50" style={{ borderLeftColor: "#ef4444" }}>
                  <p className="text-sm text-red-600 font-semibold">
                    ⚠️ Warning: Deleting this question will also delete all associated answer steps due to CASCADE constraints.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div 
                className="border-t p-6 flex gap-3 rounded-b-2xl"
                style={{ borderColor: color.mist, background: `${color.mist}11` }}
              >
                <button
                  onClick={() => setShowDeleteQuestionConfirm(false)}
                  disabled={saving}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 shadow-sm"
                  style={{ background: color.mist, color: color.deep }}
                >
                  Cancel
                </button>
                <button
                  onClick={executeDeleteQuestion}
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

      {/* ----------------------------- Add Question Modal ----------------------------- */}
      <AnimatePresence>
        {showAddQuestionModal && selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                resetAddQuestionModal();
              }
            }}
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
              {/* Modal Header */}
              <div 
                className="px-6 py-4 flex items-center justify-between"
                style={{ background: color.teal }}
              >
                <h2 className="text-xl font-bold text-white">Add New Question</h2>
                <button
                  onClick={resetAddQuestionModal}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  disabled={saving}
                  title="Close"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
                <div className="p-6 space-y-6">
                  {/* Question Fields */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: color.teal }}>
                      Question Details
                    </h3>
                    
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: color.deep }}>
                        Question Text *
                      </label>
                      <textarea
                        value={addQuestionText}
                        onChange={(e) => setAddQuestionText(e.target.value)}
                        disabled={saving}
                        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 resize-none disabled:bg-gray-100"
                        style={{ borderColor: color.mist }}
                        placeholder="Enter question text (supports LaTeX)..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: color.deep }}>
                        Category Text
                      </label>
                      <input
                        type="text"
                        value={addCategoryText}
                        onChange={(e) => setAddCategoryText(e.target.value)}
                        disabled={saving}
                        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white placeholder-gray-400 disabled:bg-gray-100"
                        style={{ borderColor: color.mist }}
                        placeholder="Enter category text (optional)..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: color.deep }}>
                          Question Type *
                        </label>
                        <select
                          value={addQuestionType}
                          onChange={(e) => setAddQuestionType(e.target.value)}
                          disabled={saving}
                          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white disabled:bg-gray-100"
                          style={{ borderColor: color.mist }}
                        >
                          <option value="step-by-step">step-by-step</option>
                          <option value="multiple-choice">multiple-choice</option>
                          <option value="true-false">true-false</option>
                          <option value="fill-in-blank">fill-in-blank</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: color.deep }}>
                          Answer Type
                        </label>
                        <select
                          value={addAnswerType}
                          onChange={(e) => setAddAnswerType(e.target.value)}
                          disabled={saving}
                          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white disabled:bg-gray-100"
                          style={{ borderColor: color.mist }}
                        >
                          <option value="multiLine">Multi Line</option>
                          <option value="singleLine">Single Line</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Answer Steps Section */}
                  <div className="border-t pt-6" style={{ borderColor: color.mist }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: color.teal }}>
                        Answer Steps
                      </h3>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold uppercase" style={{ color: color.steel }}>
                          Steps (Max 10):
                        </label>
                        <div className="flex items-center gap-1">
                          {/* Decrement Button */}
                          <button
                            onClick={() => setMaxSteps(prev => Math.max(1, prev - 1))}
                            disabled={saving || maxSteps <= 1}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                            style={{ borderColor: color.mist, color: color.steel }}
                            title="Decrease steps"
                          >
                            <ChevronDown size={16} />
                          </button>
                          
                          {/* Number Input */}
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={maxSteps}
                            onChange={(e) => setMaxSteps(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                            disabled={saving}
                            className="w-14 px-2 py-1 border-2 rounded-lg text-sm text-center font-semibold disabled:bg-gray-50"
                            style={{ borderColor: color.mist, color: color.deep }}
                          />
                          
                          {/* Increment Button */}
                          <button
                            onClick={() => setMaxSteps(prev => Math.min(10, prev + 1))}
                            disabled={saving || maxSteps >= 10}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                            style={{ borderColor: color.mist, color: color.steel }}
                            title="Increase steps"
                          >
                            <ChevronUp size={16} />
                          </button>
                        </div>
                        
                        <button
                          onClick={initializeSteps}
                          disabled={saving}
                          className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          style={{ background: color.teal, color: "white" }}
                        >
                          Submit Steps
                        </button>
                      </div>
                    </div>

                    {/* Steps Forms */}
                    {stepForms.length > 0 && (
                      <div className="space-y-4">
                        {stepForms.map((form, stepIndex) => (
                          <div
                            key={stepIndex}
                            className="p-4 rounded-xl border"
                            style={{ borderColor: color.mist, background: `${color.teal}05` }}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                                style={{ background: color.teal, color: "white" }}
                              >
                                {stepIndex + 1}
                              </div>
                              <span className="text-xs font-bold uppercase" style={{ color: color.teal }}>
                                STEP {stepIndex + 1}
                              </span>
                            </div>

                            <div className="space-y-3">
                              {/* Direction (Placeholder) */}
                              <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: color.deep }}>
                                  Direction
                                </label>
                                <input
                                  type="text"
                                  value={form.placeholder}
                                  onChange={(e) => updateStepForm(stepIndex, "placeholder", e.target.value)}
                                  disabled={saving}
                                  className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
                                  style={{ borderColor: color.mist }}
                                  placeholder="Enter direction (will be wrapped in \text{})"
                                />
                              </div>

                              {/* Label */}
                              <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: color.deep }}>
                                  Label
                                </label>
                                <select
                                  value={form.label}
                                  onChange={(e) => updateStepForm(stepIndex, "label", e.target.value)}
                                  disabled={saving}
                                  className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
                                  style={{ borderColor: color.mist }}
                                >
                                  <option value="substitution">substitution</option>
                                  <option value="evaluation">evaluation</option>
                                  <option value="simplification">simplification</option>
                                  <option value="final">final</option>
                                </select>
                              </div>

                              {/* Answer Variants */}
                              <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: color.deep }}>
                                  Answer Variants
                                </label>
                                <div className="space-y-2">
                                  {form.variants.map((variant, variantIndex) => (
                                    <div key={variantIndex} className="flex gap-2">
                                      <input
                                        type="text"
                                        value={variant}
                                        onChange={(e) => updateVariant(stepIndex, variantIndex, e.target.value)}
                                        disabled={saving}
                                        className="flex-1 px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50"
                                        style={{ borderColor: color.mist }}
                                        placeholder={`Variant ${variantIndex + 1}`}
                                      />
                                      {form.variants.length > 1 && (
                                        <button
                                          onClick={() => removeVariant(stepIndex, variantIndex)}
                                          disabled={saving}
                                          className="px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                                          style={{ background: "#fee", color: "#ef4444" }}
                                        >
                                          <X size={16} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  {form.variants.length < 5 && (
                                    <button
                                      onClick={() => addVariant(stepIndex)}
                                      disabled={saving}
                                      className="w-full px-3 py-2 border-2 border-dashed rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                      style={{ borderColor: color.teal, color: color.teal }}
                                    >
                                      + Add Variant
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div 
                className="border-t p-6 flex gap-3 rounded-b-2xl"
                style={{ borderColor: color.mist, background: `${color.mist}11` }}
              >
                <button
                  onClick={resetAddQuestionModal}
                  disabled={saving}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 shadow-sm"
                  style={{ background: color.mist, color: color.deep }}
                >
                  Cancel
                </button>
                <button
                  onClick={addQuestion}
                  disabled={saving || !addQuestionText.trim()}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors disabled:opacity-50 shadow-md"
                  style={{ background: color.teal, color: "#fff" }}
                >
                  {saving ? "Adding..." : "Add Question & Steps"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
