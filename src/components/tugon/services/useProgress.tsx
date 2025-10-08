import { useState, useEffect, useCallback } from 'react';
import { progressService, AttemptResult, UserProgress } from './progressServices';

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(progressService.getUserProgress());
  const [isLoading, setIsLoading] = useState(false);

  const refreshProgress = useCallback(() => {
    setProgress(progressService.getUserProgress());
  }, []);

  const recordAttempt = useCallback((attemptResult: AttemptResult) => {
    setIsLoading(true);
    try {
      progressService.recordAttempt(attemptResult);
      refreshProgress();
    } finally {
      setIsLoading(false);
    }
  }, [refreshProgress]);

  const resetProgress = useCallback(() => {
    setIsLoading(true);
    try {
      progressService.resetProgress();
      refreshProgress();
    } finally {
      setIsLoading(false);
    }
  }, [refreshProgress]);

  const resetTopicProgress = useCallback((topicId: number) => {
    setIsLoading(true);
    try {
      progressService.resetTopicProgress(topicId);
      refreshProgress();
    } finally {
      setIsLoading(false);
    }
  }, [refreshProgress]);

  const getStatistics = useCallback(() => {
    return progressService.getStatistics();
  }, []);

  useEffect(() => {
    // Auto-refresh on window focus
    const handleFocus = () => refreshProgress();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshProgress]);

  return {
    progress,
    isLoading,
    recordAttempt,
    resetProgress,
    resetTopicProgress,
    refreshProgress,
    getStatistics,
    // Convenience methods
    getTopicProgress: (topicId: number) => progressService.getTopicProgress(topicId),
    getCategoryProgress: (topicId: number, categoryId: number) => progressService.getCategoryProgress(topicId, categoryId),
    getQuestionProgress: (topicId: number, categoryId: number, questionId: number) => 
      progressService.getQuestionProgress(topicId, categoryId, questionId),
  };
}