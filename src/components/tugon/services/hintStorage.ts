import type { SessionHints } from './hintGenerator';

class HintStorageService {
  private storage = new Map<string, SessionHints>();
  private readonly STORAGE_KEY_PREFIX = 'tugon_hints_';

  /**
   * Generate storage key for a question
   */
  private getStorageKey(topicId: number, categoryId: number, questionId: number): string {
    return `${this.STORAGE_KEY_PREFIX}${topicId}_${categoryId}_${questionId}`;
  }

  /**
   * Store generated hints for a session
   */
  storeHints(hints: SessionHints): void {
    const key = this.getStorageKey(hints.topicId, hints.categoryId, hints.questionId);
    this.storage.set(key, hints);
    
    // Also store in localStorage for persistence
    try {
      localStorage.setItem(key, JSON.stringify(hints));
    } catch (error) {
      console.warn('Failed to persist hints to localStorage:', error);
    }
  }

  /**
   * Retrieve stored hints for a question
   */
  getHints(topicId: number, categoryId: number, questionId: number): SessionHints | null {
    const key = this.getStorageKey(topicId, categoryId, questionId);
    
    // Check memory first
    let hints = this.storage.get(key);
    
    // Fallback to localStorage
    if (!hints) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          hints = JSON.parse(stored);
          if (hints) {
            this.storage.set(key, hints);
          }
        }
      } catch (error) {
        console.warn('Failed to load hints from localStorage:', error);
      }
    }

    return hints || null;
  }

  /**
   * Check if hints exist for a question
   */
  hasHints(topicId: number, categoryId: number, questionId: number): boolean {
    return this.getHints(topicId, categoryId, questionId) !== null;
  }

  /**
   * Clear hints for a specific question
   */
  clearHints(topicId: number, categoryId: number, questionId: number): void {
    const key = this.getStorageKey(topicId, categoryId, questionId);
    this.storage.delete(key);
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear hints from localStorage:', error);
    }
  }

  /**
   * Clear all stored hints
   */
  clearAllHints(): void {
    // Clear memory
    this.storage.clear();
    
    // Clear localStorage
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.STORAGE_KEY_PREFIX)
      );
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear hints from localStorage:', error);
    }
  }
}

export const hintStorage = new HintStorageService();