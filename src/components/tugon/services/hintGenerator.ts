import { getAnswerStringsForQuestion } from '../../data/answers/index';
import { defaultTopics } from '../../data/questions/index';
import type { Topic, Question, GivenQuestion } from '../../data/questions/types';

export interface PreGeneratedHint {
  stepIndex: number;
  hintText: string;
  behaviorType: 'struggling' | 'guessing' | 'repeating' | 'self-correction' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SessionHints {
  topicId: number;
  categoryId: number;
  questionId: number;
  hints: PreGeneratedHint[];
  generatedAt: number;
}

class HintGeneratorService {
  private readonly AI_ENDPOINT = import.meta.env.DEV
    ? (import.meta.env.VITE_API_BASE
        ? `${import.meta.env.VITE_API_BASE.replace(/\/$/, "")}/api/generate-hints`
        : "/api/generate-hints")
    : "/api/generate-hints";

  /**
   * Generate all hints for a specific question before the session starts
   */
  async generateSessionHints(
    topicId: number, 
    categoryId: number, 
    questionId: number
  ): Promise<SessionHints> {
    try {
      const questionContext = this.getQuestionContext(topicId, categoryId, questionId);
      const expectedAnswers = getAnswerStringsForQuestion(topicId, categoryId, questionId);
      
      const payload = {
        topicId,
        categoryId,
        questionId,
        questionContext,
        expectedAnswers,
        behaviorTypes: ['struggling', 'guessing', 'repeating', 'self-correction', 'general'],
        stepCount: expectedAnswers?.length || 5
      };

      const response = await fetch(this.AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Hint generation failed: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        topicId,
        categoryId,
        questionId,
        hints: result.hints || this.generateFallbackHints(questionContext),
        generatedAt: Date.now()
      };

    } catch (error) {
      console.error('❌ Hint Generation Error:', error);
      
      // Fallback to predefined hints
      const questionContext = this.getQuestionContext(topicId, categoryId, questionId);
      return {
        topicId,
        categoryId,
        questionId,
        hints: this.generateFallbackHints(questionContext),
        generatedAt: Date.now()
      };
    }
  }

  /**
   * Get question context for hint generation
   */
  private getQuestionContext(topicId: number, categoryId: number, questionId: number) {
    const topic = defaultTopics.find((t: Topic) => t.id === topicId);
    const category = topic?.level.find((c: Question) => c.category_id === categoryId);
    const question = category?.given_question.find((q: GivenQuestion) => q.question_id === questionId);
    
    return {
      topicName: topic?.name || 'Unknown Topic',
      categoryQuestion: category?.category_question || 'Unknown Category',
      questionText: question?.question_text || 'Unknown Question',
      guideText: question?.guide_text || 'No guide available',
      categoryText: question?.category_text || ''
    };
  }

  /**
   * Generate fallback hints when AI fails
   */
  private generateFallbackHints(questionContext: any): PreGeneratedHint[] {
    const baseHints = [
      {
        stepIndex: 0,
        hintText: `Let's break down this ${questionContext.categoryQuestion} problem step by step. ${questionContext.guideText}`,
        behaviorType: 'general' as const,
        difficulty: 'easy' as const
      },
      {
        stepIndex: 1,
        hintText: `Remember the key concept: ${questionContext.guideText}. Take your time to think through each step.`,
        behaviorType: 'struggling' as const,
        difficulty: 'medium' as const
      },
      {
        stepIndex: 2,
        hintText: `You're making progress! Focus on applying the method systematically rather than guessing.`,
        behaviorType: 'guessing' as const,
        difficulty: 'medium' as const
      },
      {
        stepIndex: 3,
        hintText: `I notice you're trying the same approach. Consider what might work differently here.`,
        behaviorType: 'repeating' as const,
        difficulty: 'hard' as const
      },
      {
        stepIndex: 4,
        hintText: `Great self-awareness! Keep refining your approach - you're on the right track.`,
        behaviorType: 'self-correction' as const,
        difficulty: 'easy' as const
      }
    ];

    return baseHints;
  }
}

export const hintGenerator = new HintGeneratorService();