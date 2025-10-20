import { supabase } from './supabase';
import type { QuestionProgress, CategoryProgress, TopicProgress, AttemptResult } from '../components/tugon/services/progressServices';

// Supabase database types
export interface SupabaseUserTopicProgress {
  id: string;
  user_id: string;
  topic_id: number;
  is_completed: boolean;
  completion_percentage: number;
  correct_answers: number;
  total_questions: number;
  first_started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseUserCategoryProgress {
  id: string;
  user_id: string;
  topic_id: number;
  category_id: number;
  is_completed: boolean;
  completion_percentage: number;
  correct_answers: number;
  total_questions: number;
  current_question_index: number;
  attempts: number;
  success_modal_shown: boolean;
  ever_completed: boolean;
  first_started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseUserQuestionProgress {
  id: string;
  user_id: string;
  topic_id: number;
  category_id: number;
  question_id: number;
  is_completed: boolean;
  attempts: number;
  correct_answers: number;
  time_spent: number;
  best_score: number | null;
  color_coded_hints_used: number;
  short_hint_messages_used: number;
  current_session_attempts: number;
  latest_attempt: any; // JSONB
  fastest_attempt: any; // JSONB
  last_attempt_at: string | null;
  created_at: string;
  updated_at: string;
}

export class SupabaseProgressService {
  
  /**
   * Get current authenticated user ID
   */
  private async getUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Get category progress from Supabase
   */
  async getCategoryProgress(topicId: number, categoryId: number): Promise<CategoryProgress | null> {
    const userId = await this.getUserId();
    if (!userId) {
      console.error('No authenticated user');
      return null;
    }

    try {
      // Get category progress
      const { data: categoryData, error: categoryError } = await supabase
        .from('tugonsense_user_category_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .eq('category_id', categoryId)
        .single();

      if (categoryError && categoryError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (expected for new categories)
        console.error('Error fetching category progress:', categoryError);
        return null;
      }

      if (!categoryData) {
        // No progress exists yet
        return null;
      }

      // Get question progress for this category
      const { data: questionsData, error: questionsError } = await supabase
        .from('tugonsense_user_question_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .eq('category_id', categoryId);

      if (questionsError) {
        console.error('Error fetching question progress:', questionsError);
        return null;
      }

      // Transform to CategoryProgress format
      const questionProgress: QuestionProgress[] = (questionsData || []).map(q => ({
        questionId: q.question_id,
        isCompleted: q.is_completed,
        attempts: q.attempts,
        correctAnswers: q.correct_answers,
        timeSpent: q.time_spent,
        lastAttemptDate: q.last_attempt_at ? new Date(q.last_attempt_at) : new Date(),
        bestScore: q.best_score || undefined,
        colorCodedHintsUsed: q.color_coded_hints_used,
        shortHintMessagesUsed: q.short_hint_messages_used,
        currentSessionAttempts: q.current_session_attempts,
        latestAttempt: q.latest_attempt ? {
          timestamp: new Date(q.latest_attempt.timestamp),
          timeSpent: q.latest_attempt.timeSpent,
          attempts: q.latest_attempt.attempts,
          colorHintsUsed: q.latest_attempt.colorHintsUsed,
          shortHintsUsed: q.latest_attempt.shortHintsUsed,
        } : undefined,
        fastestAttempt: q.fastest_attempt ? {
          timestamp: new Date(q.fastest_attempt.timestamp),
          timeSpent: q.fastest_attempt.timeSpent,
          attempts: q.fastest_attempt.attempts,
          colorHintsUsed: q.fastest_attempt.colorHintsUsed,
          shortHintsUsed: q.fastest_attempt.shortHintsUsed,
        } : undefined,
      }));

      return {
        categoryId: categoryData.category_id,
        questionProgress,
        isCompleted: categoryData.is_completed,
        completionPercentage: Number(categoryData.completion_percentage),
        correctAnswers: categoryData.correct_answers,
        totalQuestions: categoryData.total_questions,
        firstStartedDate: categoryData.first_started_at ? new Date(categoryData.first_started_at) : undefined,
        completedDate: categoryData.completed_at ? new Date(categoryData.completed_at) : undefined,
        currentQuestionIndex: categoryData.current_question_index,
        attempts: categoryData.attempts,
        successModalShown: categoryData.success_modal_shown,
        everCompleted: categoryData.ever_completed,
      };

    } catch (error) {
      console.error('Unexpected error in getCategoryProgress:', error);
      return null;
    }
  }

  /**
   * Get category stats (lightweight version for ProgressMap)
   */
  async getCategoryStats(topicId: number, categoryId: number) {
    const categoryProgress = await this.getCategoryProgress(topicId, categoryId);
    
    if (!categoryProgress) {
      return {
        currentQuestionIndex: 0,
        attempts: 0,
        isCompleted: false,
        completionPercentage: 0,
        correctAnswers: 0,
        totalQuestions: 0,
      };
    }
    
    return {
      currentQuestionIndex: categoryProgress.currentQuestionIndex,
      attempts: categoryProgress.attempts,
      isCompleted: categoryProgress.isCompleted,
      completionPercentage: categoryProgress.completionPercentage,
      correctAnswers: categoryProgress.correctAnswers,
      totalQuestions: categoryProgress.totalQuestions,
    };
  }

  /**
   * Get topic progress from Supabase
   */
  async getTopicProgress(topicId: number): Promise<TopicProgress | null> {
    const userId = await this.getUserId();
    if (!userId) return null;

    try {
      // Get topic progress
      const { data: topicData, error: topicError } = await supabase
        .from('tugonsense_user_topic_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .single();

      if (topicError && topicError.code !== 'PGRST116') {
        console.error('Error fetching topic progress:', topicError);
        return null;
      }

      // Get all category progress for this topic
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('tugonsense_user_category_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_id', topicId);

      if (categoriesError) {
        console.error('Error fetching categories progress:', categoriesError);
        return null;
      }

      // Get all question progress for this topic
      const { data: questionsData, error: questionsError } = await supabase
        .from('tugonsense_user_question_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_id', topicId);

      if (questionsError) {
        console.error('Error fetching questions progress:', questionsError);
        return null;
      }

      // Build category progress with nested questions
      const categoryProgress: CategoryProgress[] = (categoriesData || []).map(cat => {
        const categoryQuestions = (questionsData || [])
          .filter(q => q.category_id === cat.category_id)
          .map(q => ({
            questionId: q.question_id,
            isCompleted: q.is_completed,
            attempts: q.attempts,
            correctAnswers: q.correct_answers,
            timeSpent: q.time_spent,
            lastAttemptDate: q.last_attempt_at ? new Date(q.last_attempt_at) : new Date(),
            bestScore: q.best_score || undefined,
            colorCodedHintsUsed: q.color_coded_hints_used,
            shortHintMessagesUsed: q.short_hint_messages_used,
            currentSessionAttempts: q.current_session_attempts,
            latestAttempt: q.latest_attempt,
            fastestAttempt: q.fastest_attempt,
          }));

        return {
          categoryId: cat.category_id,
          questionProgress: categoryQuestions,
          isCompleted: cat.is_completed,
          completionPercentage: Number(cat.completion_percentage),
          correctAnswers: cat.correct_answers,
          totalQuestions: cat.total_questions,
          firstStartedDate: cat.first_started_at ? new Date(cat.first_started_at) : undefined,
          completedDate: cat.completed_at ? new Date(cat.completed_at) : undefined,
          currentQuestionIndex: cat.current_question_index,
          attempts: cat.attempts,
          successModalShown: cat.success_modal_shown,
          everCompleted: cat.ever_completed,
        };
      });

      if (!topicData) {
        // Return structure with empty progress if no topic record exists
        return {
          topicId,
          categoryProgress,
          isCompleted: false,
          completionPercentage: 0,
          correctAnswers: 0,
          totalQuestions: 0,
        };
      }

      return {
        topicId: topicData.topic_id,
        categoryProgress,
        isCompleted: topicData.is_completed,
        completionPercentage: Number(topicData.completion_percentage),
        correctAnswers: topicData.correct_answers,
        totalQuestions: topicData.total_questions,
        firstStartedDate: topicData.first_started_at ? new Date(topicData.first_started_at) : undefined,
        completedDate: topicData.completed_at ? new Date(topicData.completed_at) : undefined,
      };

    } catch (error) {
      console.error('Unexpected error in getTopicProgress:', error);
      return null;
    }
  }

  /**
   * Record an attempt to Supabase
   */
  async recordAttempt(attemptResult: AttemptResult): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) {
      console.error('Cannot record attempt: No authenticated user');
      return;
    }

    try {
      // 1. Get or create question progress
      const { data: questionData, error: fetchError } = await supabase
        .from('tugonsense_user_question_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_id', attemptResult.topicId)
        .eq('category_id', attemptResult.categoryId)
        .eq('question_id', attemptResult.questionId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching question progress:', fetchError);
        return;
      }

      const currentSessionAttempts = (questionData?.current_session_attempts || 0) + 1;
      const totalAttempts = (questionData?.attempts || 0) + 1;

      const questionUpdate: any = {
        user_id: userId,
        topic_id: attemptResult.topicId,
        category_id: attemptResult.categoryId,
        question_id: attemptResult.questionId,
        attempts: totalAttempts,
        current_session_attempts: currentSessionAttempts,
        time_spent: (questionData?.time_spent || 0) + attemptResult.timeSpent,
        is_completed: attemptResult.isCorrect ? true : (questionData?.is_completed || false),
        correct_answers: attemptResult.isCorrect ? (questionData?.correct_answers || 0) + 1 : (questionData?.correct_answers || 0),
        color_coded_hints_used: (questionData?.color_coded_hints_used || 0) + (attemptResult.colorCodedHintsUsed || 0),
        short_hint_messages_used: (questionData?.short_hint_messages_used || 0) + (attemptResult.shortHintMessagesUsed || 0),
        last_attempt_at: new Date().toISOString(),
      };

      // If correct, save latest/fastest attempts
      if (attemptResult.isCorrect) {
        const latestAttempt = {
          timestamp: new Date().toISOString(),
          timeSpent: attemptResult.timeSpent,
          attempts: currentSessionAttempts,
          colorHintsUsed: attemptResult.colorCodedHintsUsed || 0,
          shortHintsUsed: attemptResult.shortHintMessagesUsed || 0,
        };

        questionUpdate.latest_attempt = latestAttempt;
        questionUpdate.current_session_attempts = 0; // Reset after completion

        // Update fastest if applicable
        if (!questionData?.fastest_attempt || attemptResult.timeSpent < questionData.fastest_attempt.timeSpent) {
          questionUpdate.fastest_attempt = latestAttempt;
        }
      }

      // Upsert question progress
      const { error: upsertError } = await supabase
        .from('tugonsense_user_question_progress')
        .upsert(questionUpdate, { 
          onConflict: 'user_id,topic_id,category_id,question_id' 
        });

      if (upsertError) {
        console.error('Error upserting question progress:', upsertError);
        return;
      }

      // 2. Update category progress
      await this.recalculateCategoryProgress(userId, attemptResult.topicId, attemptResult.categoryId);

      // 3. Update topic progress
      await this.recalculateTopicProgress(userId, attemptResult.topicId);

      console.log('✅ Attempt recorded to Supabase');

    } catch (error) {
      console.error('Unexpected error in recordAttempt:', error);
    }
  }

  /**
   * Recalculate category progress
   */
  private async recalculateCategoryProgress(userId: string, topicId: number, categoryId: number): Promise<void> {
    // Get all question progress for this category
    const { data: questions, error } = await supabase
      .from('tugonsense_user_question_progress')
      .select('is_completed, attempts')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .eq('category_id', categoryId);

    if (error) {
      console.error('Error fetching questions for recalculation:', error);
      return;
    }

    // Get total questions from category metadata
    const { data: categoryMeta, error: categoryError } = await supabase
      .from('tugonsense_categories')
      .select('id')
      .eq('topic_id', topicId)
      .eq('category_id', categoryId)
      .single();

    if (categoryError) {
      console.error('Error fetching category metadata:', categoryError);
      return;
    }

    // Get actual question count
    const { count: totalQuestions } = await supabase
      .from('tugonsense_questions')
      .select('id', { count: 'exact', head: true })
      .eq('topic_id', topicId)
      .eq('category_id', categoryId);

    const completedCount = questions?.filter(q => q.is_completed).length || 0;
    const totalAttempts = questions?.reduce((sum, q) => sum + (q.attempts || 0), 0) || 0;
    const completionPercentage = totalQuestions ? (completedCount / totalQuestions) * 100 : 0;
    const isCompleted = completionPercentage === 100;

    // Upsert category progress
    const { error: upsertError } = await supabase
      .from('tugonsense_user_category_progress')
      .upsert({
        user_id: userId,
        topic_id: topicId,
        category_id: categoryId,
        is_completed: isCompleted,
        completion_percentage: completionPercentage,
        correct_answers: completedCount,
        total_questions: totalQuestions || 0,
        attempts: totalAttempts,
        ever_completed: isCompleted ? true : undefined,
        completed_at: isCompleted ? new Date().toISOString() : undefined,
      }, { 
        onConflict: 'user_id,topic_id,category_id',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('Error upserting category progress:', upsertError);
    }
  }

  /**
   * Recalculate topic progress
   */
  private async recalculateTopicProgress(userId: string, topicId: number): Promise<void> {
    const { data: categories, error } = await supabase
      .from('tugonsense_user_category_progress')
      .select('is_completed, correct_answers, total_questions')
      .eq('user_id', userId)
      .eq('topic_id', topicId);

    if (error) {
      console.error('Error fetching categories for topic recalculation:', error);
      return;
    }

    const totalQuestions = categories?.reduce((sum, cat) => sum + (cat.total_questions || 0), 0) || 0;
    const correctAnswers = categories?.reduce((sum, cat) => sum + (cat.correct_answers || 0), 0) || 0;
    const completionPercentage = totalQuestions ? (correctAnswers / totalQuestions) * 100 : 0;
    const isCompleted = categories?.every(cat => cat.is_completed) || false;

    const { error: upsertError } = await supabase
      .from('tugonsense_user_topic_progress')
      .upsert({
        user_id: userId,
        topic_id: topicId,
        is_completed: isCompleted,
        completion_percentage: completionPercentage,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        completed_at: isCompleted ? new Date().toISOString() : null,
      }, { 
        onConflict: 'user_id,topic_id' 
      });

    if (upsertError) {
      console.error('Error upserting topic progress:', upsertError);
    }
  }

  /**
   * Reset category progress for replay
   */
  async resetCategoryProgress(topicId: number, categoryId: number): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) return;

    // Reset all questions to incomplete
    const { error: questionsError } = await supabase
      .from('tugonsense_user_question_progress')
      .update({
        is_completed: false,
        correct_answers: 0,
        current_session_attempts: 0,
      })
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .eq('category_id', categoryId);

    if (questionsError) {
      console.error('Error resetting question progress:', questionsError);
      return;
    }

    // Reset category (keep everCompleted flag)
    const { error: categoryError } = await supabase
      .from('tugonsense_user_category_progress')
      .update({
        is_completed: false,
        success_modal_shown: false,
        completion_percentage: 0,
        correct_answers: 0,
        attempts: 0,
        current_question_index: 0,
      })
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .eq('category_id', categoryId);

    if (categoryError) {
      console.error('Error resetting category progress:', categoryError);
    }
  }
}

// Export singleton
export const supabaseProgressService = new SupabaseProgressService();
