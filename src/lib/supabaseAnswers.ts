// src/lib/supabaseAnswers.ts
import { supabase } from './supabase';
import type { Step, PredefinedAnswer } from '@/components/data/answers/types';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface SupabaseAnswerStep {
  id: number;
  topic_id: number;
  category_id: number;
  question_id: number;
  step_order: number;
  label: string;
  answer_variants: string[]; // JSONB array from database
  placeholder: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// FETCH FUNCTIONS
// ==========================================

/**
 * Fetch answer steps for a specific question
 * This is the main function to replace getAnswerForQuestion()
 */
export async function fetchAnswerSteps(
  topicId: number,
  categoryId: number,
  questionId: number
): Promise<Step[]> {
  try {
    console.log(`📝 Fetching answer steps from Supabase for Question (${topicId}, ${categoryId}, ${questionId})`);
    
    const { data, error } = await supabase
      .from('tugonsense_answer_steps')
      .select('*')
      .eq('topic_id', topicId)
      .eq('category_id', categoryId)
      .eq('question_id', questionId)
      .order('step_order', { ascending: true });

    if (error) {
      console.error('❌ Error fetching answer steps:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn(`⚠️ No answer steps found for Question (${topicId}, ${categoryId}, ${questionId})`);
      return [];
    }

    console.log(`✅ Fetched ${data.length} answer steps from Supabase`);

    // Convert Supabase format to Step[] format
    const steps: Step[] = data.map((row: SupabaseAnswerStep) => ({
      label: row.label as Step['label'],
      answer: row.answer_variants, // Already an array from JSONB
      placeholder: row.placeholder || undefined,
    }));

    console.log('📊 Converted steps:', steps);

    return steps;

  } catch (error) {
    console.error(`❌ Fatal error fetching answer steps for (${topicId}, ${categoryId}, ${questionId}):`, error);
    throw error;
  }
}

/**
 * Fetch answer steps and format as PredefinedAnswer
 * This matches your existing PredefinedAnswer format for backward compatibility
 */
export async function fetchPredefinedAnswer(
  topicId: number,
  categoryId: number,
  questionId: number,
  questionText?: string
): Promise<PredefinedAnswer | null> {
  try {
    const steps = await fetchAnswerSteps(topicId, categoryId, questionId);
    
    if (steps.length === 0) {
      return null;
    }

    // Format as PredefinedAnswer
    const predefinedAnswer: PredefinedAnswer = {
      questionId: questionId,
      questionText: questionText || `Question ${questionId}`,
      type: 'multiLine',
      steps: steps,
    };

    return predefinedAnswer;

  } catch (error) {
    console.error(`❌ Error creating PredefinedAnswer for (${topicId}, ${categoryId}, ${questionId}):`, error);
    return null;
  }
}

/**
 * Fetch all answer steps for a category (useful for preloading)
 */
export async function fetchAnswerStepsByCategory(
  topicId: number,
  categoryId: number
): Promise<Map<number, Step[]>> {
  try {
    console.log(`📝 Fetching all answer steps for Category (${topicId}, ${categoryId})`);
    
    const { data, error } = await supabase
      .from('tugonsense_answer_steps')
      .select('*')
      .eq('topic_id', topicId)
      .eq('category_id', categoryId)
      .order('question_id', { ascending: true })
      .order('step_order', { ascending: true });

    if (error) {
      console.error('❌ Error fetching category answer steps:', error);
      throw error;
    }

    console.log(`✅ Fetched ${data?.length || 0} answer steps for category`);

    // Group by question_id
    const answersByQuestion = new Map<number, Step[]>();

    if (data) {
      data.forEach((row: SupabaseAnswerStep) => {
        const step: Step = {
          label: row.label as Step['label'],
          answer: row.answer_variants,
          placeholder: row.placeholder || undefined,
        };

        if (!answersByQuestion.has(row.question_id)) {
          answersByQuestion.set(row.question_id, []);
        }
        answersByQuestion.get(row.question_id)!.push(step);
      });
    }

    return answersByQuestion;

  } catch (error) {
    console.error(`❌ Error fetching category answer steps (${topicId}, ${categoryId}):`, error);
    throw error;
  }
}

/**
 * Get total step count for a question
 */
export async function getAnswerStepCount(
  topicId: number,
  categoryId: number,
  questionId: number
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('tugonsense_answer_steps')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topicId)
      .eq('category_id', categoryId)
      .eq('question_id', questionId);

    if (error) throw error;

    return count || 0;

  } catch (error) {
    console.error(`❌ Error getting step count for (${topicId}, ${categoryId}, ${questionId}):`, error);
    return 0;
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Validate that answer_variants is properly formatted
 */
export function validateAnswerVariants(answerVariants: any): boolean {
  return (
    Array.isArray(answerVariants) &&
    answerVariants.length > 0 &&
    answerVariants.every((variant) => typeof variant === 'string')
  );
}

/**
 * Convert Step[] back to database format (for future admin tools)
 */
export function convertStepsToDatabaseFormat(
  steps: Step[],
  topicId: number,
  categoryId: number,
  questionId: number
): Omit<SupabaseAnswerStep, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>[] {
  return steps.map((step, index) => ({
    topic_id: topicId,
    category_id: categoryId,
    question_id: questionId,
    step_order: index + 1,
    label: step.label,
    answer_variants: Array.isArray(step.answer) ? step.answer : [step.answer],
    placeholder: step.placeholder || null,
  }));
}

// ==========================================
// FALLBACK INTEGRATION
// ==========================================

/**
 * Hybrid function that tries Supabase first, then falls back to hardcoded
 * Use this during migration period
 */
export async function getAnswerForQuestionHybrid(
  topicId: number,
  categoryId: number,
  questionId: number,
  fallbackFunction?: (topicId: number, categoryId: number, questionId: number) => Step[] | undefined
): Promise<Step[]> {
  try {
    // Try Supabase first
    const steps = await fetchAnswerSteps(topicId, categoryId, questionId);
    
    if (steps.length > 0) {
      console.log('✅ Using Supabase answer steps');
      return steps;
    }

    // Fallback to hardcoded if Supabase returns empty
    if (fallbackFunction) {
      console.warn('⚠️ Supabase returned empty, falling back to hardcoded answers');
      const hardcodedSteps = fallbackFunction(topicId, categoryId, questionId);
      return hardcodedSteps || [];
    }

    return [];

  } catch (error) {
    console.error('❌ Error in hybrid answer fetch, using fallback:', error);
    
    // Fallback on error
    if (fallbackFunction) {
      const hardcodedSteps = fallbackFunction(topicId, categoryId, questionId);
      return hardcodedSteps || [];
    }

    return [];
  }
}
