import { defaultTopics } from '../../data/question';

export interface QuestionProgress {
  questionId: number;
  isCompleted: boolean;
  attempts: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  lastAttemptDate: Date;
  bestScore?: number; // percentage if applicable
}

export interface CategoryProgress {
  categoryId: number;
  questionProgress: QuestionProgress[];
  isCompleted: boolean;
  completionPercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  firstStartedDate?: Date;
  completedDate?: Date;
  currentQuestionIndex: number; // Random question index for this category
  attempts: number; // Total attempts for this category
}

export interface TopicProgress {
  topicId: number;
  categoryProgress: CategoryProgress[];
  isCompleted: boolean;
  completionPercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  firstStartedDate?: Date;
  completedDate?: Date;
}

export interface UserProgress {
  userId: string;
  topicProgress: TopicProgress[];
  lastUpdated: Date;
  totalTimeSpent: number;
  overallCompletionPercentage: number;
  streak: number; // days
  lastActivityDate: Date;
}

export interface AttemptResult {
  topicId: number;
  categoryId: number;
  questionId: number;
  isCorrect: boolean;
  timeSpent: number;
  score?: number; // percentage if applicable
}

class ProgressService {
  private readonly STORAGE_KEY = 'tugon_user_progress';
  private readonly USER_ID_KEY = 'tugon_user_id';
  
  // Generate or get user ID
  private getUserId(): string {
    let userId = localStorage.getItem(this.USER_ID_KEY);
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(this.USER_ID_KEY, userId);
    }
    return userId;
  }

  // Initialize progress structure
  private initializeProgress(): UserProgress {
    const userId = this.getUserId();
    const now = new Date();
    
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

  // Get user progress from localStorage
  getUserProgress(): UserProgress {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        const initialProgress = this.initializeProgress();
        this.saveProgress(initialProgress);
        return initialProgress;
      }

      const progress = JSON.parse(stored) as UserProgress;
      // Convert date strings back to Date objects
      progress.lastUpdated = new Date(progress.lastUpdated);
      progress.lastActivityDate = new Date(progress.lastActivityDate);
      
      progress.topicProgress.forEach(topic => {
        if (topic.firstStartedDate) topic.firstStartedDate = new Date(topic.firstStartedDate);
        if (topic.completedDate) topic.completedDate = new Date(topic.completedDate);
        
        topic.categoryProgress.forEach(category => {
          if (category.firstStartedDate) category.firstStartedDate = new Date(category.firstStartedDate);
          if (category.completedDate) category.completedDate = new Date(category.completedDate);
          
          category.questionProgress.forEach(question => {
            question.lastAttemptDate = new Date(question.lastAttemptDate);
          });
        });
      });

      return progress;
    } catch (error) {
      console.error('Error loading progress:', error);
      return this.initializeProgress();
    }
  }

  // Save progress to localStorage
  private saveProgress(progress: UserProgress): void {
    try {
      progress.lastUpdated = new Date();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }
  
  // Get or create topic progress
  private getOrCreateTopicProgress(progress: UserProgress, topicId: number): TopicProgress {
    let topicProgress = progress.topicProgress.find(tp => tp.topicId === topicId);
    
    if (!topicProgress) {
      topicProgress = {
        topicId,
        categoryProgress: [],
        isCompleted: false,
        completionPercentage: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        firstStartedDate: new Date(),
      };
      progress.topicProgress.push(topicProgress);
    }

    return topicProgress;
  }

  // Get or create category progress
  private getOrCreateCategoryProgress(topicProgress: TopicProgress, categoryId: number): CategoryProgress {
    let categoryProgress = topicProgress.categoryProgress.find(cp => cp.categoryId === categoryId);
    
    if (!categoryProgress) {
      // Get the actual category data to determine total questions
      const topicData = defaultTopics.find(t => t.id === topicProgress.topicId);
      const categoryData = topicData?.level.find(cat => cat.category_id === categoryId);
      const totalQuestions = categoryData?.given_question.length || 0;
      
      // Generate random question index for this category
      const randomQuestionIndex = totalQuestions > 0 ? Math.floor(Math.random() * totalQuestions) : 0;
      
      categoryProgress = {
        categoryId,
        questionProgress: [],
        isCompleted: false,
        completionPercentage: 0,
        correctAnswers: 0,
        totalQuestions,
        firstStartedDate: new Date(),
        currentQuestionIndex: randomQuestionIndex,
        attempts: 0
      };
      topicProgress.categoryProgress.push(categoryProgress);
    }

    return categoryProgress;
  }

  // Get or create question progress
  private getOrCreateQuestionProgress(categoryProgress: CategoryProgress, questionId: number): QuestionProgress {
    let questionProgress = categoryProgress.questionProgress.find(qp => qp.questionId === questionId);
    
    if (!questionProgress) {
      questionProgress = {
        questionId,
        isCompleted: false,
        attempts: 0,
        correctAnswers: 0,
        timeSpent: 0,
        lastAttemptDate: new Date(),
      };
      categoryProgress.questionProgress.push(questionProgress);
    }

    return questionProgress;
  }

  // Update current question index for a category
  updateCurrentQuestionIndex(topicId: number, categoryId: number, newQuestionIndex: number): void {
    const progress = this.getUserProgress();
    const topicProgress = this.getOrCreateTopicProgress(progress, topicId);
    const categoryProgress = this.getOrCreateCategoryProgress(topicProgress, categoryId);
    
    categoryProgress.currentQuestionIndex = newQuestionIndex;
    this.saveProgress(progress);
  }

  // Get current question for a category
  getCurrentQuestion(topicId: number, categoryId: number): number {
    const categoryProgress = this.getCategoryProgress(topicId, categoryId);
    
    if (!categoryProgress) {
      // If no category progress exists, create it first
      const progress = this.getUserProgress();
      const topicProgress = this.getOrCreateTopicProgress(progress, topicId);
      const newCategoryProgress = this.getOrCreateCategoryProgress(topicProgress, categoryId);
      this.saveProgress(progress);
      return newCategoryProgress.currentQuestionIndex;
    }
    
    return categoryProgress.currentQuestionIndex ?? 0;
  }

  // Record an attempt with category-based progress tracking
  recordAttempt(attemptResult: AttemptResult): void {
    const progress = this.getUserProgress();
    const topicProgress = this.getOrCreateTopicProgress(progress, attemptResult.topicId);
    const categoryProgress = this.getOrCreateCategoryProgress(topicProgress, attemptResult.categoryId);
    const questionProgress = this.getOrCreateQuestionProgress(categoryProgress, attemptResult.questionId);

    // Update question progress
    questionProgress.attempts++;
    questionProgress.timeSpent += attemptResult.timeSpent;
    questionProgress.lastAttemptDate = new Date();
    
    // Update category attempts
    categoryProgress.attempts++;
    
    if (attemptResult.isCorrect) {
      questionProgress.correctAnswers++;
      questionProgress.isCompleted = true;
      
      // Move to next random question in category after correct answer
      const topicData = defaultTopics.find(t => t.id === attemptResult.topicId);
      const categoryData = topicData?.level.find(cat => cat.category_id === attemptResult.categoryId);
      const totalQuestions = categoryData?.given_question.length || 1;
      
      // Generate new random question index (different from current)
      let newQuestionIndex;
      do {
        newQuestionIndex = Math.floor(Math.random() * totalQuestions);
      } while (newQuestionIndex === categoryProgress.currentQuestionIndex && totalQuestions > 1);
      
      categoryProgress.currentQuestionIndex = newQuestionIndex;
      
      if (attemptResult.score !== undefined) {
        questionProgress.bestScore = Math.max(questionProgress.bestScore || 0, attemptResult.score);
      }
    }

    // Update activity tracking
    progress.lastActivityDate = new Date();
    progress.totalTimeSpent += attemptResult.timeSpent;

    // Recalculate progress
    this.recalculateProgress(progress);
    this.saveProgress(progress);
  }

  // Mark a category as completed
  markCategoryCompleted(topicId: number, categoryId: number): void {
    const progress = this.getUserProgress();
    const topicProgress = this.getOrCreateTopicProgress(progress, topicId);
    const categoryProgress = this.getOrCreateCategoryProgress(topicProgress, categoryId);
    
    categoryProgress.isCompleted = true;
    categoryProgress.completionPercentage = 100;
    categoryProgress.completedDate = new Date();
    
    this.recalculateProgress(progress);
    this.saveProgress(progress);
  }

  // Check if user should advance to next question
  shouldAdvanceToNextQuestion(topicId: number, categoryId: number, questionId: number): boolean {
    const questionProgress = this.getQuestionProgress(topicId, categoryId, questionId);
    return questionProgress?.isCompleted || false;
  }

  // Get category statistics for ProgressMap
  getCategoryStats(topicId: number, categoryId: number) {
    const categoryProgress = this.getCategoryProgress(topicId, categoryId);
    
    if (!categoryProgress) {
      // Create default stats for non-existent category
      const topicData = defaultTopics.find(t => t.id === topicId);
      const categoryData = topicData?.level.find(cat => cat.category_id === categoryId);
      const totalQuestions = categoryData?.given_question.length || 0;
      
      return {
        currentQuestionIndex: totalQuestions > 0 ? Math.floor(Math.random() * totalQuestions) : 0,
        attempts: 0,
        isCompleted: false,
        completionPercentage: 0,
        correctAnswers: 0,
        totalQuestions
      };
    }
    
    return {
      currentQuestionIndex: categoryProgress.currentQuestionIndex,
      attempts: categoryProgress.attempts,
      isCompleted: categoryProgress.isCompleted,
      completionPercentage: categoryProgress.completionPercentage,
      correctAnswers: categoryProgress.correctAnswers,
      totalQuestions: categoryProgress.totalQuestions
    };
  }

  // Recalculate all progress percentages
  private recalculateProgress(progress: UserProgress): void {
    let totalQuestions = 0;
    let totalCorrect = 0;

    progress.topicProgress.forEach(topicProgress => {
      let topicQuestions = 0;
      let topicCorrect = 0;

      // Get the actual topic structure from question data
      const topicData = defaultTopics.find(t => t.id === topicProgress.topicId);
      
      if (topicData) {
        // Calculate based on actual topic structure, not just attempted questions
        topicData.level.forEach(category => {
          const categoryId = category.category_id;
          const actualQuestionCount = category.given_question.length;
          
          // Find existing category progress or create empty one
          let categoryProgress = topicProgress.categoryProgress.find(cp => cp.categoryId === categoryId);
          
          if (!categoryProgress) {
            // Create complete empty category progress for unstarted categories
            categoryProgress = {
              categoryId,
              questionProgress: [],
              isCompleted: false,
              completionPercentage: 0,
              correctAnswers: 0,
              totalQuestions: actualQuestionCount,
              firstStartedDate: undefined,
              completedDate: undefined,
              currentQuestionIndex: Math.floor(Math.random() * Math.max(1, actualQuestionCount)),
              attempts: 0
            };
            topicProgress.categoryProgress.push(categoryProgress);
          }

          // Calculate correct answers for this category
          const categoryCorrect = categoryProgress.questionProgress.filter(qp => qp.isCompleted).length;
          
          // Update category progress with ACTUAL question count
          categoryProgress.totalQuestions = actualQuestionCount;
          categoryProgress.correctAnswers = categoryCorrect;
          categoryProgress.completionPercentage = actualQuestionCount > 0 ? (categoryCorrect / actualQuestionCount) * 100 : 0;
          categoryProgress.isCompleted = categoryProgress.completionPercentage === 100;

          if (categoryProgress.isCompleted && !categoryProgress.completedDate) {
            categoryProgress.completedDate = new Date();
          }

          // Add to topic totals using ACTUAL counts
          topicQuestions += actualQuestionCount;
          topicCorrect += categoryCorrect;
        });
      } else {
        // Fallback: use existing logic if topic data not found
        topicProgress.categoryProgress.forEach(categoryProgress => {
          const categoryQuestions = categoryProgress.questionProgress.length;
          const categoryCorrect = categoryProgress.questionProgress.filter(qp => qp.isCompleted).length;

          categoryProgress.totalQuestions = categoryQuestions;
          categoryProgress.correctAnswers = categoryCorrect;
          categoryProgress.completionPercentage = categoryQuestions > 0 ? (categoryCorrect / categoryQuestions) * 100 : 0;
          categoryProgress.isCompleted = categoryProgress.completionPercentage === 100;

          topicQuestions += categoryQuestions;
          topicCorrect += categoryCorrect;
        });
      }

      // Update topic progress with ACTUAL totals
      topicProgress.totalQuestions = topicQuestions;
      topicProgress.correctAnswers = topicCorrect;
      topicProgress.completionPercentage = topicQuestions > 0 ? (topicCorrect / topicQuestions) * 100 : 0;
      topicProgress.isCompleted = topicProgress.completionPercentage === 100;

      if (topicProgress.isCompleted && !topicProgress.completedDate) {
        topicProgress.completedDate = new Date();
      }

      totalQuestions += topicQuestions;
      totalCorrect += topicCorrect;
    });

    progress.overallCompletionPercentage = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    this.updateStreak(progress);
  }

  // Update activity streak
  private updateStreak(progress: UserProgress): void {
    const today = new Date();
    const lastActivity = progress.lastActivityDate;
    
    // Reset to start of day for comparison
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastActivityStart = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
    
    const daysDiff = Math.floor((todayStart.getTime() - lastActivityStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Activity today, streak continues
      return;
    } else if (daysDiff === 1) {
      // Activity yesterday, increment streak
      progress.streak++;
    } else {
      // Gap in activity, reset streak
      progress.streak = 1;
    }
  }

  // Get progress for a specific topic
  getTopicProgress(topicId: number): TopicProgress | undefined {
    const progress = this.getUserProgress();
    return progress.topicProgress.find(tp => tp.topicId === topicId);
  }

  // Get progress for a specific category
  getCategoryProgress(topicId: number, categoryId: number): CategoryProgress | undefined {
    const topicProgress = this.getTopicProgress(topicId);
    return topicProgress?.categoryProgress.find(cp => cp.categoryId === categoryId);
  }

  // Get progress for a specific question
  getQuestionProgress(topicId: number, categoryId: number, questionId: number): QuestionProgress | undefined {
    const categoryProgress = this.getCategoryProgress(topicId, categoryId);
    return categoryProgress?.questionProgress.find(qp => qp.questionId === questionId);
  }

  // Reset all progress (for testing or user request)
  resetProgress(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Reset progress for a specific topic
  resetTopicProgress(topicId: number): void {
    const progress = this.getUserProgress();
    progress.topicProgress = progress.topicProgress.filter(tp => tp.topicId !== topicId);
    this.recalculateProgress(progress);
    this.saveProgress(progress);
  }

  // Export progress for backup
  exportProgress(): string {
    return localStorage.getItem(this.STORAGE_KEY) || '';
  }

  // Import progress from backup
  importProgress(progressData: string): boolean {
    try {
      const parsed = JSON.parse(progressData);
      localStorage.setItem(this.STORAGE_KEY, progressData);
      return true;
    } catch (error) {
      console.error('Error importing progress:', error);
      return false;
    }
  }

  // Get statistics
  getStatistics() {
    const progress = this.getUserProgress();
    return {
      totalTopics: progress.topicProgress.length,
      completedTopics: progress.topicProgress.filter(tp => tp.isCompleted).length,
      totalQuestions: progress.topicProgress.reduce((sum, tp) => sum + tp.totalQuestions, 0),
      completedQuestions: progress.topicProgress.reduce((sum, tp) => sum + tp.correctAnswers, 0),
      totalTimeSpent: progress.totalTimeSpent,
      averageTimePerQuestion: progress.topicProgress.reduce((sum, tp) => sum + tp.totalQuestions, 0) > 0 
        ? progress.totalTimeSpent / progress.topicProgress.reduce((sum, tp) => sum + tp.totalQuestions, 0) 
        : 0,
      streak: progress.streak,
      overallCompletionPercentage: progress.overallCompletionPercentage,
    };
  }
}

// Export singleton instance
export const progressService = new ProgressService();