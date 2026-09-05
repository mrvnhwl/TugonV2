import { useState, useEffect } from 'react';
import { hintGenerator } from '../components/tugon/services/hintGenerator';
import { hintStorage } from '../components/tugon/services/hintStorage';
import type { SessionHints, PreGeneratedHint } from '../components/tugon/services/hintGenerator';
import type { BehaviorType } from '../components/tugon/input-system/UserBehaviorClassifier';

export interface UseSessionHintsReturn {
  hints: SessionHints | null;
  isGenerating: boolean;
  error: string | null;
  getHintForBehavior: (stepIndex: number, behavior: BehaviorType) => string | null;
  regenerateHints: () => Promise<void>;
}

export function useSessionHints(
  topicId: number,
  categoryId: number,
  questionId: number
): UseSessionHintsReturn {
  const [hints, setHints] = useState<SessionHints | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize hints when component mounts or question changes
   */
  useEffect(() => {
    initializeHints();
  }, [topicId, categoryId, questionId]);

  /**
   * Initialize hints for the current question
   */
  const initializeHints = async () => {
    try {
      setError(null);
      
      // Check if hints already exist
      const existingHints = hintStorage.getHints(topicId, categoryId, questionId);
      
      if (existingHints) {
        console.log('📚 Using existing hints for question:', { topicId, categoryId, questionId });
        setHints(existingHints);
        return;
      }

      // Generate new hints
      console.log('🤖 Generating new hints for question:', { topicId, categoryId, questionId });
      setIsGenerating(true);
      
      const newHints = await hintGenerator.generateSessionHints(topicId, categoryId, questionId);
      
      // Store the generated hints
      hintStorage.storeHints(newHints);
      setHints(newHints);
      
      console.log('✅ Hints generated and stored:', newHints);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate hints';
      setError(errorMessage);
      console.error('❌ Hint initialization failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Get appropriate hint based on step and behavior
   */
  const getHintForBehavior = (stepIndex: number, behavior: BehaviorType): string | null => {
    if (!hints) return null;

    // First, try to find exact match for behavior and step
    let hint = hints.hints.find(h => 
      h.stepIndex === stepIndex && h.behaviorType === behavior
    );

    // Fallback to general hint for the step
    if (!hint) {
      hint = hints.hints.find(h => 
        h.stepIndex === stepIndex && h.behaviorType === 'general'
      );
    }

    // Fallback to closest behavior match
    if (!hint) {
      hint = hints.hints.find(h => h.behaviorType === behavior);
    }

    // Final fallback to any available hint
    if (!hint && hints.hints.length > 0) {
      hint = hints.hints[0];
    }

    return hint?.hintText || null;
  };

  /**
   * Regenerate hints (useful for testing or manual refresh)
   */
  const regenerateHints = async () => {
    // Clear existing hints
    hintStorage.clearHints(topicId, categoryId, questionId);
    
    // Generate new ones
    await initializeHints();
  };

  return {
    hints,
    isGenerating,
    error,
    getHintForBehavior,
    regenerateHints
  };
}