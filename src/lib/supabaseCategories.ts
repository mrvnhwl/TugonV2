import { supabase } from './supabase';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface SupabaseQuestion {
  id: number;
  topic_id: number;
  category_id: number;
  question_id: number;
  category_text: string | null;
  question_text: string;
  question_type: 'step-by-step' | 'direct' | 'multiple-choice';
  guide_text: string | null;
  answer_type: 'multiLine' | 'singleLine' | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseCategory {
  id: number;
  topic_id: number;
  category_id: number;
  title: string;
  category_question: string | null;
  created_at: string;
  updated_at: string;
  questions?: SupabaseQuestion[]; // Questions belonging to this category
}

export interface SupabaseTopic {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  categories?: SupabaseCategory[]; // Categories belonging to this topic
}

// ==========================================
// FETCH FUNCTIONS
// ==========================================

/**
 * Fetch all topics with their categories and questions
 * This is the main function you'll use in ProgressMap
 */
export async function fetchTopicsWithCategoriesAndQuestions(): Promise<SupabaseTopic[]> {
  try {
    console.log('📦 Fetching topics from Supabase...');
    
    // Step 1: Fetch all topics
    const { data: topics, error: topicsError } = await supabase
      .from('tugonsense_topics')
      .select('*')
      .order('id', { ascending: true });

    if (topicsError) {
      console.error('❌ Error fetching topics:', topicsError);
      throw topicsError;
    }

    if (!topics || topics.length === 0) {
      console.warn('⚠️ No topics found in database');
      return [];
    }

    console.log(`✅ Fetched ${topics.length} topics`);

    // Step 2: Fetch all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('tugonsense_categories')
      .select('*')
      .order('topic_id', { ascending: true })
      .order('category_id', { ascending: true });

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    console.log(`✅ Fetched ${categories?.length || 0} categories`);

    // Step 3: Fetch all questions
    const { data: questions, error: questionsError } = await supabase
      .from('tugonsense_questions')
      .select('*')
      .order('topic_id', { ascending: true })
      .order('category_id', { ascending: true })
      .order('question_id', { ascending: true });

    if (questionsError) {
      console.error('❌ Error fetching questions:', questionsError);
      throw questionsError;
    }

    console.log(`✅ Fetched ${questions?.length || 0} questions`);

    // Step 4: Group questions by category
    const categoriesWithQuestions: SupabaseCategory[] = (categories || []).map((category: any) => ({
      ...category,
      questions: (questions || []).filter(
        (q: any) => q.topic_id === category.topic_id && q.category_id === category.category_id
      ),
    }));

    // Step 5: Group categories by topic
    const topicsWithCategories: SupabaseTopic[] = topics.map((topic: any) => ({
      ...topic,
      categories: categoriesWithQuestions.filter((c: any) => c.topic_id === topic.id),
    }));

    console.log('✅ Successfully structured topics with categories and questions');
    console.log('📊 Topics structure:', topicsWithCategories.map(t => ({
      id: t.id,
      name: t.name,
      categoriesCount: t.categories?.length || 0,
      totalQuestions: t.categories?.reduce((sum, c) => sum + (c.questions?.length || 0), 0) || 0,
    })));

    return topicsWithCategories;

  } catch (error) {
    console.error('❌ Fatal error in fetchTopicsWithCategoriesAndQuestions:', error);
    throw error;
  }
}

/**
 * Fetch categories for a specific topic
 */
export async function fetchCategoriesByTopic(topicId: number): Promise<SupabaseCategory[]> {
  try {
    const { data: categories, error: categoriesError } = await supabase
      .from('tugonsense_categories')
      .select('*')
      .eq('topic_id', topicId)
      .order('category_id', { ascending: true });

    if (categoriesError) throw categoriesError;

    // Fetch questions for these categories
    const { data: questions, error: questionsError } = await supabase
      .from('tugonsense_questions')
      .select('*')
      .eq('topic_id', topicId)
      .order('category_id', { ascending: true })
      .order('question_id', { ascending: true });

    if (questionsError) throw questionsError;

    // Group questions by category
    const categoriesWithQuestions: SupabaseCategory[] = (categories || []).map((category: any) => ({
      ...category,
      questions: (questions || []).filter((q: any) => q.category_id === category.category_id),
    }));

    return categoriesWithQuestions;

  } catch (error) {
    console.error(`Error fetching categories for topic ${topicId}:`, error);
    throw error;
  }
}

/**
 * Fetch questions for a specific category
 */
export async function fetchQuestionsByCategory(
  topicId: number,
  categoryId: number
): Promise<SupabaseQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('tugonsense_questions')
      .select('*')
      .eq('topic_id', topicId)
      .eq('category_id', categoryId)
      .order('question_id', { ascending: true });

    if (error) throw error;

    return data || [];

  } catch (error) {
    console.error(`Error fetching questions for topic ${topicId}, category ${categoryId}:`, error);
    throw error;
  }
}

/**
 * Fetch a single question by its composite key
 */
export async function fetchQuestion(
  topicId: number,
  categoryId: number,
  questionId: number
): Promise<SupabaseQuestion | null> {
  try {
    const { data, error } = await supabase
      .from('tugonsense_questions')
      .select('*')
      .eq('topic_id', topicId)
      .eq('category_id', categoryId)
      .eq('question_id', questionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data;

  } catch (error) {
    console.error(`Error fetching question (${topicId}, ${categoryId}, ${questionId}):`, error);
    throw error;
  }
}

/**
 * Fetch category question text and question data for CategoryQuestion component
 * This returns both the category info and the specific question in one call
 */
export async function fetchCategoryQuestionData(
  topicId: number,
  categoryId: number,
  questionId: number
): Promise<{
  categoryQuestion: string | null;
  categoryText: string | null;
  questionText: string;
  questionType: 'step-by-step' | 'direct' | 'multiple-choice';
  answerType: 'multiLine' | 'singleLine' | null;
} | null> {
  try {
    console.log(`📚 Fetching category question data for Topic ${topicId}, Category ${categoryId}, Question ${questionId}`);
    
    // Fetch the category to get category_question
    const { data: categoryData, error: categoryError } = await supabase
      .from('tugonsense_categories')
      .select('category_question')
      .eq('topic_id', topicId)
      .eq('category_id', categoryId)
      .single();

    if (categoryError) {
      console.error('❌ Error fetching category:', categoryError);
      throw categoryError;
    }

    // Fetch the specific question
    const { data: questionData, error: questionError } = await supabase
      .from('tugonsense_questions')
      .select('*')
      .eq('topic_id', topicId)
      .eq('category_id', categoryId)
      .eq('question_id', questionId)
      .single();

    if (questionError) {
      if (questionError.code === 'PGRST116') {
        console.warn('⚠️ No question found with these IDs');
        return null;
      }
      console.error('❌ Error fetching question:', questionError);
      throw questionError;
    }

    console.log('✅ Successfully fetched category question data');

    return {
      categoryQuestion: categoryData?.category_question || null,
      categoryText: questionData?.category_text || null,
      questionText: questionData?.question_text || '',
      questionType: questionData?.question_type || 'step-by-step',
      answerType: questionData?.answer_type || 'multiLine',
    };

  } catch (error) {
    console.error(`❌ Error fetching category question data (${topicId}, ${categoryId}, ${questionId}):`, error);
    throw error;
  }
}

/**
 * Get total question count for a category
 */
export async function getQuestionCount(topicId: number, categoryId: number): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('tugonsense_questions')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topicId)
      .eq('category_id', categoryId);

    if (error) throw error;

    return count || 0;

  } catch (error) {
    console.error(`Error getting question count for (${topicId}, ${categoryId}):`, error);
    return 0;
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Convert SupabaseQuestion to the format expected by your existing code
 * Use this if you need backward compatibility
 */
export function convertToLegacyQuestionFormat(question: SupabaseQuestion) {
  return {
    question_id: question.question_id,
    category_text: question.category_text || '',
    question_text: question.question_text,
    question_type: question.question_type,
    guide_text: question.guide_text || '',
  };
}

/**
 * Convert SupabaseCategory to legacy format
 */
export function convertToLegacyCategoryFormat(category: SupabaseCategory) {
  return {
    category_id: category.category_id,
    title: category.title,
    category_question: category.category_question || '',
    given_question: (category.questions || []).map(convertToLegacyQuestionFormat),
  };
}

/**
 * Convert SupabaseTopic to legacy format (compatible with defaultTopics)
 */
export function convertToLegacyTopicFormat(topic: SupabaseTopic) {
  return {
    id: topic.id,
    name: topic.name,
    description: topic.description || '',
    level: (topic.categories || []).map(convertToLegacyCategoryFormat),
  };
}
