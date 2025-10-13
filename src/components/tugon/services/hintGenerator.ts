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

  private getFallbackTemplates(): BehaviorTemplates {
    return {
      templates: [
        {
          behaviorType: 'struggling',
          templates: [
            "Hey there, I see you're {behavior}. Let's work through {wrongPart} in your {stepLabel} together!",
            "I notice you're {behavior}. Focus on {wrongPart} during {stepLabel} - take it slow!",
            "Looks like you're {behavior}. Review {wrongPart} in the {stepLabel} step carefully."
          ]
        },
        {
          behaviorType: 'guessing',
          templates: [
            "Hmm, seems you're {behavior}. Let's approach {wrongPart} in {stepLabel} systematically!",
            "I see you're {behavior}. Work through {wrongPart} during {stepLabel} step by step.",
            "Hey, you're {behavior}. Focus on {wrongPart} in your {stepLabel} methodically."
          ]
        },
        {
          behaviorType: 'repeating',
          templates: [
            "I notice you're {behavior}. Try a different approach with {wrongPart} in {stepLabel}!",
            "Looks like you're {behavior}. Let's tackle {wrongPart} during {stepLabel} differently.",
            "Hey there, you're {behavior}. Fresh perspective on {wrongPart} in {stepLabel}?"
          ]
        },
        {
          behaviorType: 'self-correction',
          templates: [
            "Great awareness! You're {behavior}. Keep refining {wrongPart} in your {stepLabel}!",
            "Nice catch! Since you're {behavior}, polish {wrongPart} during {stepLabel}.",
            "Good self-check! You're {behavior}. Almost there with {wrongPart} in {stepLabel}!"
          ]
        },
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
            "Hey, looks like you're {behavior}. Check {wrongPart} in your {stepLabel} - signs matter!",
            "I see you're {behavior}. Review {wrongPart} during {stepLabel}. Plus or minus?",
            "Hmm, you're {behavior}. Focus on {wrongPart} in {stepLabel} - that operator needs attention!"
          ]
        },
        {
          behaviorType: 'magnitude-error',
          templates: [
            "I notice you're {behavior}. Double-check {wrongPart} in your {stepLabel}!",
            "Hey, you're {behavior}. Verify {wrongPart} during {stepLabel} - check the math!",
            "Looks like you're {behavior}. Pay attention to {wrongPart} in {stepLabel}!"
          ]
        },
        {
          behaviorType: 'close-attempt',
          templates: [
            "So close! You're {behavior}. Just fix {wrongPart} in your {stepLabel}!",
            "Almost there! Since you're {behavior}, polish {wrongPart} during {stepLabel}!",
            "Great work! You're {behavior}. One more look at {wrongPart} in {stepLabel}!"
          ]
        }
      ],
      generatedAt: Date.now(),
      expiresIn: 86400000
    };
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

  clearCache() {
    this.cachedTemplates = null;
  }
}

export const hintGenerator = new HintGeneratorService();