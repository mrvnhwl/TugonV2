/**
 * Curated Hint Loader Service
 * Loads template-based hints from the hints folder and converts them to BehaviorTemplates format
 */

import type { BehaviorTemplates, HintTemplate } from './hintGenerator';
import type { CategoryHints, StepHint, BehaviorType } from '../../data/hints/types';

// Import all hint categories
import { Topic1_Category1_Hints } from '../../data/hints/topic1/category1';
import { Topic1_Category2_Hints } from '../../data/hints/topic1/category2';
import { Topic1_Category3_Hints } from '../../data/hints/topic1/category3';
import { Topic1_Category4_Hints } from '../../data/hints/topic1/category4';
// Add more imports as needed:
// import { Topic2_Category1_Hints } from '../data/hints/topic2/category1';

export class CuratedHintLoader {
  private static hintRegistry: Map<string, CategoryHints> = new Map();

  static {
    // Register all hint categories
    this.registerHints(1, 1, Topic1_Category1_Hints);
    this.registerHints(1, 2, Topic1_Category2_Hints);
    this.registerHints(1, 3, Topic1_Category3_Hints);
    this.registerHints(1, 4, Topic1_Category4_Hints);
    // Add more registrations:
    // this.registerHints(2, 1, Topic2_Category1_Hints);
  }

  private static registerHints(topicId: number, categoryId: number, hints: CategoryHints) {
    const key = `${topicId}-${categoryId}`;
    this.hintRegistry.set(key, hints);
    console.log(`📝 CuratedHintLoader: Registered hints for Topic ${topicId}, Category ${categoryId} (${hints.categoryName})`);
    console.log(`   - Questions: ${hints.questions.map(q => q.questionId).join(', ')}`);
    console.log(`   - Registry key: "${key}"`);
  }

  /**
   * Get context-aware templates for specific question and step
   */
  static getContextualTemplates(
    topicId: number,
    categoryId: number,
    questionId: number,
    stepLabel?: string
  ): BehaviorTemplates {
    console.log('🎯 CONTEXTUAL HINT LOADER: Getting hints for context:', {
      topicId,
      categoryId,
      questionId,
      stepLabel
    });

    const key = `${topicId}-${categoryId}`;
    console.log(`🔑 CuratedHintLoader: Looking for registry key: "${key}"`);
    console.log(`📚 CuratedHintLoader: Available keys:`, Array.from(this.hintRegistry.keys()));
    
    const categoryHints = this.hintRegistry.get(key);

    if (!categoryHints) {
      console.log('🚨 CONTEXTUAL HINT LOADER: No category found for key:', key);
      console.log('🚨 FALLING BACK TO GENERIC TEMPLATES');
      return this.getFallbackTemplates();
    }

    console.log(`✅ CuratedHintLoader: Found category "${categoryHints.categoryName}" with ${categoryHints.questions.length} questions`);

    // Get specific question
    const questionHints = categoryHints.questions.find(q => q.questionId === questionId);
    if (!questionHints) {
      console.log('🚨 CONTEXTUAL HINT LOADER: No question found for ID:', questionId);
      console.log('🚨 Available question IDs:', categoryHints.questions.map(q => q.questionId));
      console.log('🚨 FALLING BACK TO GENERIC TEMPLATES');
      return this.getFallbackTemplates();
    }

    console.log(`✅ CuratedHintLoader: Found question ${questionId} - "${questionHints.questionText}"`);

    // Get specific step hints (if stepLabel provided, filter by it)
    const relevantSteps = stepLabel 
      ? questionHints.stepHints.filter(step => step.stepLabel === stepLabel)
      : questionHints.stepHints;

    if (relevantSteps.length === 0) {
      console.log('🚨 CONTEXTUAL HINT LOADER: No relevant steps found for stepLabel:', stepLabel);
      console.log('🚨 Available step labels:', questionHints.stepHints.map(s => s.stepLabel));
      console.log('🚨 FALLING BACK TO GENERIC TEMPLATES');
      return this.getFallbackTemplates();
    }

    console.log(`✅ CuratedHintLoader: Found ${relevantSteps.length} relevant steps for "${stepLabel || 'all steps'}"`);
    console.log(`   Step labels:`, relevantSteps.map(s => s.stepLabel));

    const behaviorTypes: BehaviorType[] = [
      'sign-error',
      'magnitude-error', 
      'close-attempt',
      'repetition',
      'guessing'
    ];

    const templates: HintTemplate[] = [];

    // Map behavior types to template behavior types
    const behaviorMapping: Record<BehaviorType, string> = {
      'sign-error': 'sign-error',
      'magnitude-error': 'magnitude-error',
      'close-attempt': 'close-attempt',
      'repetition': 'repeating',
      'guessing': 'guessing',
      'random': 'general',
      'default': 'general'
    };

    // Extract templates for each behavior from relevant steps only
    for (const behaviorType of behaviorTypes) {
      const templateStrings: string[] = [];

      // Collect templates from relevant steps only
      for (const stepHint of relevantSteps) {
        const hintText = this.getHintForBehavior(stepHint, behaviorType);
        if (hintText) {
          templateStrings.push(hintText);
        }
      }

      // Remove duplicates and take up to 3 variations
      const uniqueTemplates = [...new Set(templateStrings)];
      const selectedTemplates = uniqueTemplates.slice(0, 3);

      // Pad with contextual templates if we don't have enough
      while (selectedTemplates.length < 3) {
        const contextualTemplate = `Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} for this ${categoryHints.categoryName.toLowerCase()} problem!`;
        selectedTemplates.push(contextualTemplate);
      }

      templates.push({
        behaviorType: behaviorMapping[behaviorType] as any,
        templates: selectedTemplates
      });
    }

    // Add general and other behavior types with contextual fallbacks
    templates.push({
      behaviorType: 'general',
      templates: [
        `Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} for this ${categoryHints.categoryName.toLowerCase()} problem!`,
        `I see you're {behavior}. Review {wrongPart} during {stepLabel} in this ${categoryHints.categoryName.toLowerCase()} question.`,
        `Looks like you're {behavior}. Focus on {wrongPart} in the {stepLabel} step!`
      ]
    });

    templates.push({
      behaviorType: 'struggling',
      templates: [
        `I see you're {behavior}. Let's work through {wrongPart} in your {stepLabel} for this ${categoryHints.categoryName.toLowerCase()} problem together!`,
        `I notice you're {behavior}. Focus on {wrongPart} during {stepLabel} - take it slow with ${categoryHints.categoryName.toLowerCase()}!`,
        `Looks like you're {behavior}. Review {wrongPart} in the {stepLabel} step carefully.`
      ]
    });

    templates.push({
      behaviorType: 'self-correction',
      templates: [
        `Great awareness! You're {behavior}. Keep refining {wrongPart} in your {stepLabel} for this ${categoryHints.categoryName.toLowerCase()} problem!`,
        `Nice catch! Since you're {behavior}, polish {wrongPart} during {stepLabel}.`,
        `Good self-check! You're {behavior}. Almost there with {wrongPart} in {stepLabel}!`
      ]
    });

    console.log('✅ CONTEXTUAL HINT LOADER: Successfully created contextual templates for:', categoryHints.categoryName);
    console.log('🎯 CONTEXTUAL HINT LOADER: Sample template:', templates[0]?.templates[0]);

    return {
      templates,
      generatedAt: Date.now(),
      expiresIn: 86400000 // 24 hours
    };
  }

  /**
   * Convert behavior-specific hints to template format (LEGACY - uses all hints)
   */
  static convertToTemplateFormat(): BehaviorTemplates {
    console.log('🎯 CURATED HINT LOADER: Starting template conversion...');
    console.log('🎯 CURATED HINT LOADER: Registered categories:', Array.from(this.hintRegistry.keys()));
    const behaviorTypes: BehaviorType[] = [
      'sign-error',
      'magnitude-error', 
      'close-attempt',
      'repetition',
      'guessing'
    ];

    const templates: HintTemplate[] = [];

    // Map behavior types to template behavior types
    const behaviorMapping: Record<BehaviorType, string> = {
      'sign-error': 'sign-error',
      'magnitude-error': 'magnitude-error',
      'close-attempt': 'close-attempt',
      'repetition': 'repeating',
      'guessing': 'guessing',
      'random': 'general',
      'default': 'general'
    };

    // Extract templates for each behavior
    for (const behaviorType of behaviorTypes) {
      const templateStrings: string[] = [];

      // Collect templates from all registered hints
      for (const [, categoryHints] of this.hintRegistry.entries()) {
        for (const questionHints of categoryHints.questions) {
          for (const stepHint of questionHints.stepHints) {
            const hintText = this.getHintForBehavior(stepHint, behaviorType);
            if (hintText) {
              templateStrings.push(hintText);
            }
          }
        }
      }

      // Remove duplicates and take up to 3 variations
      const uniqueTemplates = [...new Set(templateStrings)];
      const selectedTemplates = uniqueTemplates.slice(0, 3);

      // Pad with generic templates if we don't have enough
      while (selectedTemplates.length < 3) {
        selectedTemplates.push(`Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} carefully!`);
      }

      templates.push({
        behaviorType: behaviorMapping[behaviorType] as any,
        templates: selectedTemplates
      });
    }

    // Add general and other behavior types with fallbacks
    templates.push({
      behaviorType: 'general',
      templates: [
        "Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} carefully!",
        "I see you're {behavior}. Review {wrongPart} during {stepLabel}.",
        "Looks like you're {behavior}. Focus on {wrongPart} in the {stepLabel} step!"
      ]
    });

    templates.push({
      behaviorType: 'struggling',
      templates: [
        "I see you're {behavior}. Let's work through {wrongPart} in your {stepLabel} together!",
        "I notice you're {behavior}. Focus on {wrongPart} during {stepLabel} - take it slow!",
        "Looks like you're {behavior}. Review {wrongPart} in the {stepLabel} step carefully."
      ]
    });

    templates.push({
      behaviorType: 'self-correction',
      templates: [
        "Great awareness! You're {behavior}. Keep refining {wrongPart} in your {stepLabel}!",
        "Nice catch! Since you're {behavior}, polish {wrongPart} during {stepLabel}.",
        "Good self-check! You're {behavior}. Almost there with {wrongPart} in {stepLabel}!"
      ]
    });

    console.log('🎯 CURATED HINT LOADER: Successfully created templates:', templates.length, 'behaviors');
    console.log('🎯 CURATED HINT LOADER: Sample template:', templates[0]?.templates[0]);

    return {
      templates,
      generatedAt: Date.now(),
      expiresIn: 86400000 // 24 hours
    };
  }

  /**
   * Get fallback templates when no specific context is available
   */
  private static getFallbackTemplates(): BehaviorTemplates {
    console.log('🚨 FALLBACK: Using generic fallback templates');
    return {
      templates: [
        {
          behaviorType: 'general',
          templates: [
            "Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} carefully!",
            "I see you're {behavior}. Review {wrongPart} during {stepLabel}.",
            "Looks like you're {behavior}. Focus on {wrongPart} in the {stepLabel} step!"
          ]
        },
        {
          behaviorType: 'sign-error',
          templates: [
            "I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - check those signs!",
            "Hey there, you're {behavior}. Double-check {wrongPart} during {stepLabel} for sign errors!",
            "Looks like you're {behavior}. Review {wrongPart} in {stepLabel} - watch the signs!"
          ]
        },
        {
          behaviorType: 'magnitude-error',
          templates: [
            "Looks like you're {behavior}. Review {wrongPart} during {stepLabel} - check the numbers!",
            "I see you're {behavior}. Focus on {wrongPart} in your {stepLabel} - verify the calculation!",
            "Hey there, you're {behavior}. Double-check {wrongPart} in {stepLabel} for accuracy!"
          ]
        }
      ],
      generatedAt: Date.now(),
      expiresIn: 86400000
    };
  }

  /**
   * Get specific hint text for a behavior from a step hint
   */
  private static getHintForBehavior(stepHint: StepHint, behaviorType: BehaviorType): string | null {
    switch (behaviorType) {
      case 'sign-error':
        return stepHint.signErrorHint || null;
      case 'magnitude-error':
        return stepHint.magnitudeErrorHint || null;
      case 'close-attempt':
        return stepHint.closeAttemptHint || null;
      case 'repetition':
        return stepHint.repetitionHint || null;
      case 'guessing':
        return stepHint.guessingHint || null;
      default:
        return stepHint.genericHint || null;
    }
  }

  /**
   * Get all registered hint categories (for debugging)
   */
  static getRegisteredHints(): string[] {
    return Array.from(this.hintRegistry.keys());
  }

  /**
   * Get hints for specific topic/category (for debugging)
   */
  static getHintsForCategory(topicId: number, categoryId: number): CategoryHints | null {
    const key = `${topicId}-${categoryId}`;
    return this.hintRegistry.get(key) || null;
  }

  /**
   * Get the best hint for current context and behavior
   */
  static getBestHintForContext(
    topicId: number,
    categoryId: number,
    questionId: number,
    stepLabel: string,
    behaviorType: BehaviorType
  ): string {
    console.log('🎯 BEST HINT: Getting best hint for:', {
      topicId,
      categoryId,
      questionId,
      stepLabel,
      behaviorType
    });

    const key = `${topicId}-${categoryId}`;
    const categoryHints = this.hintRegistry.get(key);

    if (!categoryHints) {
      console.log('🚨 BEST HINT: No category found, using fallback');
      return `Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} carefully!`;
    }

    // Get specific question
    const questionHints = categoryHints.questions.find(q => q.questionId === questionId);
    if (!questionHints) {
      console.log('🚨 BEST HINT: No question found, using category-specific fallback');
      return `Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} for this ${categoryHints.categoryName.toLowerCase()} problem!`;
    }

    // Get specific step
    const stepHint = questionHints.stepHints.find(step => step.stepLabel === stepLabel);
    if (!stepHint) {
      console.log('🚨 BEST HINT: No step found, using question-specific fallback');
      return `Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} for this ${categoryHints.categoryName.toLowerCase()} problem!`;
    }

    // Get behavior-specific hint
    const specificHint = this.getHintForBehavior(stepHint, behaviorType);
    if (specificHint) {
      console.log('✅ BEST HINT: Found perfect match!');
      return specificHint;
    }

    // Fallback to generic hint from this step
    if (stepHint.genericHint) {
      console.log('✅ BEST HINT: Using generic hint from this step');
      return stepHint.genericHint;
    }

    console.log('🚨 BEST HINT: No specific hint found, using contextual fallback');
    return `Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} for this ${categoryHints.categoryName.toLowerCase()} problem!`;
  }

  /**
   * Get all available steps for a specific question (for debugging)
   */
  static getAvailableSteps(topicId: number, categoryId: number, questionId: number): string[] {
    const key = `${topicId}-${categoryId}`;
    const categoryHints = this.hintRegistry.get(key);
    
    if (!categoryHints) return [];
    
    const questionHints = categoryHints.questions.find(q => q.questionId === questionId);
    if (!questionHints) return [];
    
    return questionHints.stepHints.map(step => step.stepLabel);
  }

  /**
   * Simple test method to verify the class is working
   */
  static test(): string {
    console.log('🧪 CuratedHintLoader.test() called');
    console.log('🧪 Registry size:', this.hintRegistry.size);
    console.log('🧪 Registry keys:', Array.from(this.hintRegistry.keys()));
    
    // Test contextual method
    const testContext = this.getContextualTemplates(1, 1, 1, 'substitution');
    console.log('🧪 Test contextual templates:', testContext.templates.length);
    
    // Test best hint method
    const testBestHint = this.getBestHintForContext(1, 1, 1, 'substitution', 'sign-error');
    console.log('🧪 Test best hint:', testBestHint);
    
    return 'CuratedHintLoader is working with context awareness!';
  }
}

export const curatedHintLoader = new CuratedHintLoader();