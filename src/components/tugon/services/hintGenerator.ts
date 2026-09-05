// Import curated hints directly
import { Topic1_Category1_Hints } from '../../data/hints/topic1/category1';
import { CuratedHintLoader } from './curatedHintLoader';

export interface HintTemplate {
  behaviorType: 'struggling' | 'guessing' | 'repeating' | 'self-correction' | 'general' | 
                'sign-error' | 'magnitude-error' | 'close-attempt';
  templates: string[];
}

export interface BehaviorTemplates {
  templates: HintTemplate[];
  generatedAt: number;
  expiresIn: number;
}

export class HintGeneratorService {
  private readonly AI_ENDPOINT = import.meta.env.DEV
    ? (import.meta.env.VITE_API_BASE
        ? `${import.meta.env.VITE_API_BASE.replace(/\/$/, "")}/api/gemini-hint`
        : "/api/gemini-hint")
    : "/api/gemini-hint";

  private cachedTemplates: BehaviorTemplates | null = null;

  async generateBehaviorTemplates(): Promise<BehaviorTemplates> {
    if (this.cachedTemplates) {
      const age = Date.now() - this.cachedTemplates.generatedAt;
      if (age < this.cachedTemplates.expiresIn) {
        console.log('📦 Using cached behavior templates');
        return this.cachedTemplates;
      }
    }

    try {
      console.log('🤖 Generating universal behavior templates...');

      const prompt = `You are a friendly math tutor creating hint templates for students.

Generate 3 DIFFERENT conversational hint templates for each of these 8 student behaviors.

IMPORTANT: Templates must be GENERIC to work for ANY math problem.

Use these EXACT placeholders (they will be filled at runtime):
- {behavior} = description of what the student is doing wrong
- {wrongPart} = the specific wrong part (e.g., "the + sign", "the number 12")
- {stepLabel} = the current step name (e.g., "substitution", "evaluation", "final answer")

Requirements for each template:
- Start with a friendly greeting: "Hey there," "I see," "Hmm," etc.
- Sound natural like a teacher talking to a student
- Be encouraging but direct
- 2-3 sentences maximum
- Must include ALL 3 placeholders: {behavior}, {wrongPart}, {stepLabel}
- Work for ANY math problem (don't mention specific operations)

Example: "Hey there, looks like you're {behavior}. Take a closer look at {wrongPart} in your {stepLabel} step - that's where things went off track. Let's fix it together!"

Generate for these 8 behaviors:
1. struggling: Student having general difficulty
2. guessing: Student making random attempts
3. repeating: Student using same wrong approach repeatedly
4. self-correction: Student catching their own mistakes
5. general: Generic guidance for any issue
6. sign-error: Student mixing up plus minus signs
7. magnitude-error: Student making calculation errors
8. close-attempt: Student very close to correct answer

Return ONLY valid JSON (no markdown):
{
  "templates": [
    {
      "behaviorType": "struggling",
      "templates": ["Template 1", "Template 2", "Template 3"]
    }
  ]
}`;

      const response = await fetch(this.AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash', // ✅ Gemini 2.0 Flash (stable)
          constraints: {
            maxTokens: 1200,
            temperature: 0.9,
            format: 'json'
          },
          prompt
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const parsed = this.parseAIResponse(data);

      if (parsed && Array.isArray(parsed.templates) && parsed.templates.length >= 8) {
        const templates: BehaviorTemplates = {
          templates: parsed.templates.map((t: any) => ({
            behaviorType: t.behaviorType,
            templates: Array.isArray(t.templates) && t.templates.length >= 3
              ? t.templates.slice(0, 3)
              : this.getFallbackForBehavior(t.behaviorType)
          })),
          generatedAt: Date.now(),
          expiresIn: 86400000
        };

        this.cachedTemplates = templates;
        console.log('✅ Generated behavior templates:', templates.templates.length, 'behaviors');
        return templates;
      }

      throw new Error('Invalid AI response format');

    } catch (error) {
      console.warn('⚠️ Using fallback behavior templates');
      return this.getFallbackTemplates();
    }
  }

  private parseAIResponse(data: any): any {
    const fields = ['hint', 'response', 'content', 'text', 'answer', 'data'];
    for (const field of fields) {
      if (data[field]) {
        try {
          return typeof data[field] === 'string' ? JSON.parse(data[field]) : data[field];
        } catch (e) {
          continue;
        }
      }
    }
    return null;
  }

  /**
   * Get context-aware templates for specific context
   */
  async generateContextualTemplates(
    topicId?: number,
    categoryId?: number,
    questionId?: number,
    stepLabel?: string
  ): Promise<BehaviorTemplates> {
    // ✨ PRIORITIZE CONTEXTUAL CURATED TEMPLATES when context is available
    if (topicId && categoryId && questionId) {
      console.log('🎯 Context available - using contextual curated templates');
      try {
        const curatedTemplates = CuratedHintLoader.getContextualTemplates(
          topicId,
          categoryId,
          questionId,
          stepLabel || ''
        );
        console.log('✅ Using contextual curated templates from category', categoryId);
        return curatedTemplates;
      } catch (error) {
        console.log('⚠️ Contextual curated templates failed, trying AI templates');
      }
    }
    
    // Fallback to AI-generated templates if no context or curated templates failed
    try {
      const aiTemplates = await this.generateBehaviorTemplates();
      console.log('✅ Using AI-generated behavior templates');
      return aiTemplates;
    } catch (error) {
      console.log('⚠️ AI templates failed, using generic fallback templates');
      return this.getFallbackTemplates(topicId, categoryId, questionId, stepLabel);
    }
  }

  private getFallbackTemplates(
    topicId?: number,
    categoryId?: number,
    questionId?: number,
    stepLabel?: string
  ): BehaviorTemplates {
    console.log('🔧 Loading curated hint templates with context:', {
      topicId,
      categoryId,
      questionId,
      stepLabel
    });
    
    try {
      // Use the CuratedHintLoader static methods
      
      // If we have context, use contextual templates
      if (topicId && categoryId && questionId) {
        console.log('🎯 Using CONTEXTUAL curated templates for specific question/step');
        const contextualTemplates = CuratedHintLoader.getContextualTemplates(
          topicId,
          categoryId,
          questionId,
          stepLabel || ''
        );
        console.log('✅ SUCCESS: Using contextual curated templates!', contextualTemplates.templates.length, 'behaviors');
        console.log('✅ CONTEXTUAL SAMPLE:', contextualTemplates.templates[0]?.templates[0]);
        return contextualTemplates;
      } else {
        // Fallback to generic curated templates (legacy behavior)
        console.log('🔧 Using GENERIC curated templates (legacy)');
        const curatedTemplates = this.convertCuratedHintsToTemplates();
        console.log('✅ SUCCESS: Using generic curated templates!', curatedTemplates.templates.length, 'behaviors');
        console.log('✅ CURATED SAMPLE:', curatedTemplates.templates[0]?.templates[0]);
        return curatedTemplates;
      }
    } catch (error) {
      console.error('🚨 FAILED TO LOAD CURATED TEMPLATES!');
      console.error('🚨 Error details:', error);
      console.error('🚨 Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('🚨 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // 🚨 HARDCODED FALLBACK - This should be easily identifiable
      return {
        templates: [
          {
            behaviorType: 'struggling',
            templates: [
              "🚨 HARDCODED FALLBACK: You're {behavior}. Check {wrongPart} in {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Focus on {wrongPart} during {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Review {wrongPart} in {stepLabel}!"
            ]
          },
          {
            behaviorType: 'guessing',
            templates: [
              "🚨 HARDCODED FALLBACK: You're {behavior}. Work on {wrongPart} in {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Focus on {wrongPart} during {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Check {wrongPart} in {stepLabel}!"
            ]
          },
          {
            behaviorType: 'repeating',
            templates: [
              "🚨 HARDCODED FALLBACK: You're {behavior}. Try {wrongPart} in {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Different approach with {wrongPart} in {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Fresh look at {wrongPart} in {stepLabel}!"
            ]
          },
          {
            behaviorType: 'self-correction',
            templates: [
              "🚨 HARDCODED FALLBACK: You're {behavior}. Refine {wrongPart} in {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Polish {wrongPart} during {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Almost there with {wrongPart} in {stepLabel}!"
            ]
          },
          {
            behaviorType: 'general',
            templates: [
              "🚨 HARDCODED FALLBACK: You're {behavior}. Check {wrongPart} in {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Review {wrongPart} during {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Focus on {wrongPart} in {stepLabel}!"
            ]
          },
          {
            behaviorType: 'sign-error',
            templates: [
              "🚨 HARDCODED FALLBACK: You're {behavior}. Check {wrongPart} in {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Review {wrongPart} during {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Focus on {wrongPart} in {stepLabel}!"
            ]
          },
          {
            behaviorType: 'magnitude-error',
            templates: [
              "🚨 HARDCODED FALLBACK: You're {behavior}. Check {wrongPart} in {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Verify {wrongPart} during {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Pay attention to {wrongPart} in {stepLabel}!"
            ]
          },
          {
            behaviorType: 'close-attempt',
            templates: [
              "🚨 HARDCODED FALLBACK: You're {behavior}. Fix {wrongPart} in {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Polish {wrongPart} during {stepLabel}!",
              "🚨 HARDCODED FALLBACK: Look at {wrongPart} in {stepLabel}!"
            ]
          }
        ],
        generatedAt: Date.now(),
        expiresIn: 86400000
      };
    }
  }

  private getFallbackForBehavior(behaviorType: string): string[] {
    const templates = this.getFallbackTemplates();
    const behavior = templates.templates.find(t => t.behaviorType === behaviorType);
    return behavior?.templates || [
      "Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel}!",
      "I notice you're {behavior}. Review {wrongPart} during {stepLabel}.",
      "Looks like you're {behavior}. Focus on {wrongPart} in {stepLabel}!"
    ];
  }

  /**
   * Convert curated hints from category files to template format
   */
  private convertCuratedHintsToTemplates(): BehaviorTemplates {
    console.log('🎯 Converting curated hints to template format...');
    console.log('🎯 Topic1_Category1_Hints available:', !!Topic1_Category1_Hints);
    console.log('🎯 Questions count:', Topic1_Category1_Hints?.questions?.length);

    const templates: HintTemplate[] = [];

    // Extract templates for each behavior type
    const behaviorTypes = ['sign-error', 'magnitude-error', 'close-attempt', 'repetition', 'guessing'] as const;
    
    for (const behaviorType of behaviorTypes) {
      const templateStrings: string[] = [];
      
      // Extract hints from all questions and steps
      if (Topic1_Category1_Hints?.questions) {
        for (const question of Topic1_Category1_Hints.questions) {
          for (const stepHint of question.stepHints) {
            let hintText: string | undefined;
            
            switch (behaviorType) {
              case 'sign-error':
                hintText = stepHint.signErrorHint;
                break;
              case 'magnitude-error':
                hintText = stepHint.magnitudeErrorHint;
                break;
              case 'close-attempt':
                hintText = stepHint.closeAttemptHint;
                break;
              case 'repetition':
                hintText = stepHint.repetitionHint;
                break;
              case 'guessing':
                hintText = stepHint.guessingHint;
                break;
            }
            
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
      
      // Map to correct behavior type names
      const behaviorMapping: Record<string, string> = {
        'sign-error': 'sign-error',
        'magnitude-error': 'magnitude-error',
        'close-attempt': 'close-attempt',
        'repetition': 'repeating',
        'guessing': 'guessing'
      };
      
      templates.push({
        behaviorType: behaviorMapping[behaviorType] as any,
        templates: selectedTemplates
      });
      
      console.log(`🎯 ${behaviorType}: found ${templateStrings.length} hints, using ${selectedTemplates.length}`);
    }

    // Add other required behavior types with generic templates
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

    console.log('🎯 Total templates created:', templates.length);
    
    return {
      templates,
      generatedAt: Date.now(),
      expiresIn: 86400000 // 24 hours
    };
  }

  /**
   * Get best hint for specific context and behavior
   */
  getBestContextualHint(
    topicId: number,
    categoryId: number,
    questionId: number,
    stepLabel: string,
    behaviorType: string
  ): string {
    try {
      // Map behavior types to match the curated hint system
      const behaviorMap: Record<string, any> = {
        'sign-error': 'sign-error',
        'magnitude-error': 'magnitude-error',
        'close-attempt': 'close-attempt',
        'repetition': 'repetition',
        'guessing': 'guessing',
        'random': 'default',
        'default': 'default'
      };
      
      const mappedBehavior = behaviorMap[behaviorType] || 'default';
      
      const bestHint = CuratedHintLoader.getBestHintForContext(
        topicId,
        categoryId,
        questionId,
        stepLabel,
        mappedBehavior
      );
      
      console.log('🎯 Got best contextual hint:', bestHint);
      return bestHint;
    } catch (error) {
      console.error('🚨 Failed to get contextual hint:', error);
      return "Hey there, you're {behavior}. Check {wrongPart} in your {stepLabel} - let's work through this together!";
    }
  }

  clearCache() {
    this.cachedTemplates = null;
  }
}

export const hintGenerator = new HintGeneratorService();