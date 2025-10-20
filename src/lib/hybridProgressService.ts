/**
 * Hybrid Progress Service
 * 
 * Routes progress tracking to either Supabase (authenticated users) 
 * or localStorage (guest users) seamlessly.
 * 
 * Features:
 * - Automatic authentication detection
 * - Transparent fallback to localStorage for guests
 * - Migration path from localStorage to Supabase on login
 * - Unified API matching progressServices.tsx interface
 */

import { supabase } from './supabase';
import { supabaseProgressService } from './supabaseProgress';
import { progressService } from '../components/tugon/services/progressServices';
import type { 
  AttemptResult, 
  CategoryProgress, 
  TopicProgress, 
  UserProgress 
} from '../components/tugon/services/progressServices';

class HybridProgressService {
  private isAuthenticated: boolean = false;
  private userId: string | null = null;

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state and set up auth listener
   */
  private async initializeAuth() {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    this.isAuthenticated = !!session;
    this.userId = session?.user?.id || null;

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      const wasAuthenticated = this.isAuthenticated;
      this.isAuthenticated = !!session;
      this.userId = session?.user?.id || null;

      // If user just logged in, migrate localStorage data to Supabase
      if (!wasAuthenticated && this.isAuthenticated) {
        this.migrateLocalStorageToSupabase();
      }
    });
  }

  /**
   * Migrate localStorage progress to Supabase when user logs in
   * Note: This uses the UserProgress structure which has topicProgress array
   */
  private async migrateLocalStorageToSupabase() {
    try {
      console.log('🔄 Migrating localStorage progress to Supabase...');
      
      const localProgress = progressService.getUserProgress();
      
      // Iterate through topic progress array
      for (const topicProgress of localProgress.topicProgress) {
        const topicId = topicProgress.topicId;
        
        // Iterate through category progress
        for (const categoryProgress of topicProgress.categoryProgress) {
          const categoryId = categoryProgress.categoryId;
          
          // Iterate through question progress
          for (const questionProgress of categoryProgress.questionProgress) {
            const questionId = questionProgress.questionId;
            
            // Record the latest attempt if it exists
            if (questionProgress.latestAttempt) {
              const attempt: AttemptResult = {
                topicId,
                categoryId,
                questionId,
                isCorrect: questionProgress.isCompleted, // Use isCompleted from questionProgress
                timeSpent: questionProgress.latestAttempt.timeSpent,
                colorCodedHintsUsed: questionProgress.latestAttempt.colorHintsUsed,
                shortHintMessagesUsed: questionProgress.latestAttempt.shortHintsUsed,
              };
              
              await supabaseProgressService.recordAttempt(attempt);
            }
          }
        }
      }
      
      console.log('✅ Migration completed successfully!');
    } catch (error) {
      console.error('❌ Failed to migrate localStorage to Supabase:', error);
    }
  }

  /**
   * Get user's complete progress across all topics
   */
  getUserProgress(): UserProgress | Promise<UserProgress> {
    if (this.isAuthenticated) {
      // Return async for Supabase
      return this.getSupabaseUserProgress();
    } else {
      // Return sync for localStorage
      return progressService.getUserProgress();
    }
  }

  /**
   * Get complete user progress from Supabase
   * Converts Supabase data to UserProgress format
   */
  private async getSupabaseUserProgress(): Promise<UserProgress> {
    const userId = this.userId || 'unknown';
    const now = new Date();

    try {
      // Fetch all topic progress
      const { data: topicsData, error: topicsError } = await supabase
        .from('tugonsense_user_topic_progress')
        .select('*')
        .eq('user_id', this.userId);

      if (topicsError) throw topicsError;

      // Fetch all category progress
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('tugonsense_user_category_progress')
        .select('*')
        .eq('user_id', this.userId);

      if (categoriesError) throw categoriesError;

      // Fetch all question progress
      const { data: questionsData, error: questionsError } = await supabase
        .from('tugonsense_user_question_progress')
        .select('*')
        .eq('user_id', this.userId);

      if (questionsError) throw questionsError;

      // Build topicProgress array
      const topicProgressArray: TopicProgress[] = topicsData?.map(topic => {
        const topicId = topic.topic_id;
        
        // Get categories for this topic
        const categoryProgressArray: CategoryProgress[] = categoriesData
          ?.filter(cat => cat.topic_id === topicId)
          .map(category => {
            const categoryId = category.category_id;
            
            // Get questions for this category
            const questionProgress = questionsData
              ?.filter(q => q.topic_id === topicId && q.category_id === categoryId)
              .map(question => ({
                questionId: question.question_id,
                isCompleted: question.is_correct || false,
                attempts: question.attempts || 0,
                correctAnswers: question.is_correct ? 1 : 0,
                timeSpent: question.latest_attempt?.timeSpent || 0,
                lastAttemptDate: question.updated_at ? new Date(question.updated_at) : now,
                colorCodedHintsUsed: question.latest_attempt?.colorHintsUsed || 0,
                shortHintMessagesUsed: question.latest_attempt?.shortHintsUsed || 0,
                latestAttempt: question.latest_attempt,
                fastestAttempt: question.fastest_attempt,
              })) || [];

            return {
              categoryId,
              questionProgress,
              isCompleted: category.is_completed || false,
              completionPercentage: category.completion_percentage || 0,
              correctAnswers: category.correct_answers || 0,
              totalQuestions: category.total_questions || 0,
              firstStartedDate: category.created_at ? new Date(category.created_at) : undefined,
              completedDate: category.is_completed && category.updated_at ? new Date(category.updated_at) : undefined,
              currentQuestionIndex: 0, // Default to first question
              attempts: category.correct_answers || 0, // Use correct answers as proxy for attempts
            };
          }) || [];

        return {
          topicId,
          categoryProgress: categoryProgressArray,
          isCompleted: topic.is_completed || false,
          completionPercentage: topic.completion_percentage || 0,
          correctAnswers: topic.correct_answers || 0,
          totalQuestions: topic.total_questions || 0,
          firstStartedDate: topic.created_at ? new Date(topic.created_at) : undefined,
          completedDate: topic.is_completed && topic.updated_at ? new Date(topic.updated_at) : undefined,
        };
      }) || [];

      // Calculate overall stats
      const totalTimeSpent = topicProgressArray.reduce((sum, topic) => 
        sum + topic.categoryProgress.reduce((catSum, cat) => 
          catSum + cat.questionProgress.reduce((qSum, q) => qSum + q.timeSpent, 0), 0
        ), 0
      );
      
      const totalCorrect = topicProgressArray.reduce((sum, topic) => sum + topic.correctAnswers, 0);
      const totalQuestions = topicProgressArray.reduce((sum, topic) => sum + topic.totalQuestions, 0);
      const overallCompletion = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

      const userProgress: UserProgress = {
        userId,
        topicProgress: topicProgressArray,
        lastUpdated: now,
        totalTimeSpent,
        overallCompletionPercentage: overallCompletion,
        streak: 0, // TODO: Calculate from last activity dates
        lastActivityDate: now,
      };

      return userProgress;
    } catch (error) {
      console.error('Error fetching Supabase user progress:', error);
      // Return empty progress on error
      return {
        userId,
        topicProgress: [],
        lastUpdated: now,
        totalTimeSpent: 0,
        overallCompletionPercentage: 0,
        streak: 0,
        lastActivityDate: now,
      };
    }
  }

  /**
   * Get progress for a specific category
   */
  getCategoryProgress(topicId: number, categoryId: number): CategoryProgress | Promise<CategoryProgress | null> | null {
    if (this.isAuthenticated) {
      return supabaseProgressService.getCategoryProgress(topicId, categoryId);
    } else {
      return progressService.getCategoryProgress(topicId, categoryId) || null;
    }
  }

  /**
   * Get progress for a specific topic
   */
  getTopicProgress(topicId: number): TopicProgress | Promise<TopicProgress | null> | null {
    if (this.isAuthenticated) {
      return supabaseProgressService.getTopicProgress(topicId);
    } else {
      return progressService.getTopicProgress(topicId) || null;
    }
  }

  /**
   * Record a question attempt
   */
  recordAttempt(attempt: AttemptResult): void | Promise<void> {
    if (this.isAuthenticated) {
      return supabaseProgressService.recordAttempt(attempt);
    } else {
      return progressService.recordAttempt(attempt);
    }
  }

  /**
   * Get stats for a specific category
   */
  getCategoryStats(topicId: number, categoryId: number): any | Promise<any> {
    if (this.isAuthenticated) {
      return supabaseProgressService.getCategoryStats(topicId, categoryId);
    } else {
      return progressService.getCategoryStats(topicId, categoryId);
    }
  }

  /**
   * Reset progress for a specific category
   */
  resetCategoryProgress(topicId: number, categoryId: number): void | Promise<void> {
    if (this.isAuthenticated) {
      return supabaseProgressService.resetCategoryProgress(topicId, categoryId);
    } else {
      return progressService.resetCategoryProgress(topicId, categoryId);
    }
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }
}

// Export singleton instance
export const hybridProgressService = new HybridProgressService();
export default hybridProgressService;
