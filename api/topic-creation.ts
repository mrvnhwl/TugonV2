import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from '@supabase/supabase-js';

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔥 Topic Creation/Validation API Running');
  setCors(res);
  
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const raw = (req as any).body;
    const body = typeof raw === "string" ? JSON.parse(raw) : (raw ?? {});
    
    console.log('📥 Received request body:', body);
    
    const { submissionId } = body;

    if (!submissionId) {
      return res.status(400).json({ error: "Missing submissionId" });
    }

    // Initialize Supabase client with service role (bypass RLS for backend)
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase credentials');
      return res.status(500).json({ 
        error: "Server configuration error",
        details: "VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured"
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Fetch submission
    console.log('📄 Fetching submission:', submissionId);
    const { data: submission, error: fetchError } = await supabase
      .from('topic_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      console.error('❌ Failed to fetch submission:', fetchError);
      return res.status(404).json({ error: "Submission not found" });
    }

    console.log('✅ Submission fetched:', submission);

    // Step 2: Validate with Gemini AI
    console.log('🤖 Validating with Gemini AI...');
    const validationResult = await validateWithGemini(submission);
    console.log('✅ Validation result:', validationResult);

    // Step 3: Store validation result
    console.log('💾 Storing validation result...');
    const { error: validationError } = await supabase
      .from('validation_results')
      .insert({
        submission_id: submissionId,
        validation_response: validationResult.isValid ? 'Accepted' : 'Rejected',
        validation_reason: validationResult.reason,
        validation_details: validationResult.fieldAnalysis,
        ai_response_full: validationResult,
        ai_model: 'gemini-2.0-flash',
        processing_time_ms: validationResult.processingTime || 0
      });

    if (validationError) {
      console.error('❌ Failed to store validation:', validationError);
      return res.status(500).json({ error: "Failed to store validation result" });
    }

    console.log('✅ Validation result stored');

    // Step 4: If rejected, stop here
    if (!validationResult.isValid) {
      console.log('⛔ Topic rejected by AI');
      return res.status(200).json({
        success: false,
        message: `Topic rejected: ${validationResult.reason}`,
        validation: validationResult
      });
    }

    // Step 5: Refine content with Gemini AI
    console.log('🎨 Refining content with Gemini AI...');
    const refinedContent = await refineWithGemini(submission);
    console.log('✅ Content refined:', refinedContent);

    // Step 6: Create draft topic
    console.log('💾 Creating draft topic...');
    const { data: draftTopic, error: topicError } = await supabase
      .from('teacher_topics')
      .insert({
        submission_id: submissionId,
        title: refinedContent.title,
        about_refined: refinedContent.about_refined,
        terms_expounded: refinedContent.terms_expounded,
        video_image_link: submission.video_image_link,
        status: 'pending_approval',
        is_active: false,
        ai_generated_data: refinedContent,
        created_by: submission.created_by
      })
      .select()
      .single();

    if (topicError) {
      console.error('❌ Failed to create draft topic:', topicError);
      return res.status(500).json({ error: "Failed to create draft topic" });
    }

    console.log('✅ Draft topic created:', draftTopic);

    return res.status(200).json({
      success: true,
      message: 'Topic validated and draft created successfully!',
      draftTopicId: draftTopic.id,
      validation: validationResult,
      refinedContent: refinedContent
    });

  } catch (err: any) {
    console.error("❌ [api] handler error:", err);
    return res.status(500).json({ 
      error: err.message || "Internal server error",
      details: err.stack
    });
  }
}

// ========================================
// AI VALIDATION FUNCTION
// ========================================
async function validateWithGemini(submission: any) {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENAI_API_KEY not configured');
  }

  const validationPrompt = `You are an expert in General Mathematics curriculum validation.

Analyze this topic submission and determine if ALL fields are related to General Mathematics (topics like algebra, functions, calculus, geometry, statistics, probability, trigonometry, etc.):

**Title:** ${submission.title}
**About:** ${submission.about}
**Terms:** ${Array.isArray(submission.terms) ? submission.terms.join(', ') : JSON.stringify(submission.terms)}

CRITICAL INSTRUCTIONS:
1. Respond ONLY with valid JSON (no markdown formatting, no code blocks, no extra text)
2. Check if the topic is appropriate for high school to college level General Mathematics
3. Identify any terms that are NOT related to mathematics

Required JSON format:
{
  "isValid": true,
  "reason": "All fields are appropriate for General Mathematics curriculum",
  "fieldAnalysis": {
    "title": {"valid": true, "issue": null},
    "about": {"valid": true, "issue": null},
    "terms": {"valid": true, "invalidTerms": []}
  }
}

If ANY field is unrelated to General Mathematics, set isValid to false and provide specific issues.`.trim();

  console.log('📤 Validation prompt:', validationPrompt);

  const startTime = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ 
        role: 'user', 
        parts: [{ text: validationPrompt }] 
      }],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.3,
        topP: 0.8,
        topK: 40
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Gemini API error:', errorText);
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const processingTime = Date.now() - startTime;
  console.log('📥 Gemini validation response:', data);

  const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!aiText) {
    throw new Error('No response from Gemini AI');
  }

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = aiText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('⚠️ Could not parse JSON from AI response:', aiText);
    throw new Error('Invalid AI response format');
  }

  const result = JSON.parse(jsonMatch[0]);
  result.processingTime = processingTime;
  
  return result;
}

// ========================================
// LATEX FORMATTER - Remove LaTeX formatting
// ========================================
function stripLatexFormatting(text: string): string {
  if (!text) return text;
  
  // Remove inline math: $...$ or \(...\)
  text = text.replace(/\$([^$]+)\$/g, '$1');
  text = text.replace(/\\\(([^)]+)\\\)/g, '$1');
  
  // Remove display math: $$...$$ or \[...\]
  text = text.replace(/\$\$([^$]+)\$\$/g, '$1');
  text = text.replace(/\\\[([^\]]+)\\\]/g, '$1');
  
  // Remove common LaTeX commands
  text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)'); // \frac{a}{b} -> (a)/(b)
  text = text.replace(/\\sqrt\{([^}]+)\}/g, '√($1)'); // \sqrt{x} -> √(x)
  text = text.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√($2)'); // \sqrt[n]{x} -> n√(x)
  
  // Remove LaTeX symbols
  text = text.replace(/\\geq/g, '≥');
  text = text.replace(/\\leq/g, '≤');
  text = text.replace(/\\neq/g, '≠');
  text = text.replace(/\\times/g, '×');
  text = text.replace(/\\div/g, '÷');
  text = text.replace(/\\pm/g, '±');
  text = text.replace(/\\infty/g, '∞');
  text = text.replace(/\\pi/g, 'π');
  text = text.replace(/\\theta/g, 'θ');
  text = text.replace(/\\alpha/g, 'α');
  text = text.replace(/\\beta/g, 'β');
  text = text.replace(/\\gamma/g, 'γ');
  text = text.replace(/\\delta/g, 'δ');
  text = text.replace(/\\sum/g, 'Σ');
  text = text.replace(/\\int/g, '∫');
  text = text.replace(/\\partial/g, '∂');
  
  // Remove text formatting commands
  text = text.replace(/\\textbf\{([^}]+)\}/g, '$1'); // \textbf{x} -> x
  text = text.replace(/\\textit\{([^}]+)\}/g, '$1'); // \textit{x} -> x
  text = text.replace(/\\text\{([^}]+)\}/g, '$1'); // \text{x} -> x
  
  // Remove superscript/subscript notation
  text = text.replace(/\^(\d+)/g, '^$1'); // Keep simple exponents
  text = text.replace(/\^\\?\{([^}]+)\}/g, '^($1)'); // ^{2x} -> ^(2x)
  text = text.replace(/_(\d+)/g, '_$1'); // Keep simple subscripts
  text = text.replace(/_\\?\{([^}]+)\}/g, '_($1)'); // _{2x} -> _(2x)
  
  // Remove remaining backslashes
  text = text.replace(/\\\\/g, ''); // Double backslashes
  text = text.replace(/\\(?=[a-zA-Z])/g, ''); // Backslash before letters
  
  // Clean up extra spaces
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Apply LaTeX stripping to the refined content
function cleanRefinedContent(content: any): any {
  return {
    title: stripLatexFormatting(content.title),
    about_refined: stripLatexFormatting(content.about_refined),
    terms_expounded: content.terms_expounded.map((term: any) => ({
      term: stripLatexFormatting(term.term),
      explanation: stripLatexFormatting(term.explanation)
    }))
  };
}

// ========================================
// AI REFINEMENT FUNCTION
// ========================================
async function refineWithGemini(submission: any) {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENAI_API_KEY not configured');
  }

  const terms = Array.isArray(submission.terms) ? submission.terms : JSON.parse(submission.terms);

  const refinementPrompt = `You are an expert mathematics educator creating content for high school to college students in the Philippines.

Refine this General Mathematics topic to make it educational and engaging:

**Title:** ${submission.title}
**About:** ${submission.about}
**Terms:** ${terms.join(', ')}

REQUIREMENTS:
1. Keep the title the same
2. Enhance the "about" description to be clear, engaging, and educational to children based on ${submission.title} (1 well-structured paragraphs)
3. For EACH term provided, write a detailed explanation (50 words each) that includes:
   - Clear definition suitable for students
   - Real-world applications if relevant
   - Don't involve too much numbers, optionally just symbols they need to know based on the topic only if applicable.
   - Common mistakes to avoid

CRITICAL INSTRUCTIONS FOR JSON:
1. Respond ONLY with valid JSON (no markdown code blocks, no backticks, no extra text)
2. Use FOUR backslashes for LaTeX in JSON strings: "\\\\\\\\frac{1}{2}" not "\\frac{1}{2}"
3. Do NOT use line breaks inside string values - keep everything on one line
4. Escape ALL special characters properly


Required JSON format (single line, no breaks):
{"title":"Enhanced Title","about_refined":"Enhanced description with inline math like $f(x) = x^2$ where appropriate. Second paragraph continues. Third paragraph wraps up.","terms_expounded":[{"term":"${terms[0]}","explanation":"Clear definition. Example: $f(x) = \\\\\\\\sqrt{x}$ has domain $x \\\\\\\\geq 0$. Real-world use. Common mistake."}]}

Provide ONLY the JSON object. No additional text before or after.`.trim();

  console.log('📤 Refinement prompt:', refinementPrompt);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ 
        role: 'user', 
        parts: [{ text: refinementPrompt }] 
      }],
      generationConfig: {
        maxOutputTokens: 3000, // Increased token limit
        temperature: 0.5,      // Reduced randomness for consistency
        topP: 0.9,
        topK: 40,
        responseMimeType: 'application/json' // Request JSON format
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Gemini API error:', errorText);
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('📥 Gemini refinement response (first 500 chars):', JSON.stringify(data).substring(0, 500));

  const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!aiText) {
    throw new Error('No response from Gemini AI');
  }

  console.log('📝 Raw AI text length:', aiText.length);
  console.log('📝 AI text preview:', aiText.substring(0, 200));

  // Step 1: Remove markdown code blocks
  let cleanedText = aiText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Step 2: Extract JSON object
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('⚠️ Could not find JSON in AI response');
    console.error('📄 Full AI response:', aiText);
    throw new Error('Invalid AI response format - no JSON found');
  }

  let jsonString = jsonMatch[0];
  console.log('📝 Extracted JSON length:', jsonString.length);

  // Step 3: Fix common JSON issues with 3-attempt recovery
  try {
    // Attempt 1: Parse as-is
    const parsed = JSON.parse(jsonString);
    console.log('✅ JSON parsed successfully on first attempt');
    const cleaned = cleanRefinedContent(parsed);
    console.log('🧹 LaTeX formatting stripped from content');
    return cleaned;
  } catch (firstError: any) {
    console.warn('⚠️ First parse failed:', firstError.message);
    
    // Attempt 2: Fix escaped backslashes
    try {
      // Replace quadruple backslashes with double
      const fixedBackslashes = jsonString.replace(/\\\\\\\\/g, '\\\\');
      const parsed = JSON.parse(fixedBackslashes);
      console.log('✅ JSON parsed after fixing backslashes');
      const cleaned = cleanRefinedContent(parsed);
      console.log('🧹 LaTeX formatting stripped from content');
      return cleaned;
    } catch (secondError: any) {
      console.warn('⚠️ Second parse failed:', secondError.message);
      
      // Attempt 3: Try to repair truncated JSON
      try {
        let repairedJson = jsonString;
        
        // Count open braces and brackets
        const openBraces = (repairedJson.match(/\{/g) || []).length;
        const closeBraces = (repairedJson.match(/\}/g) || []).length;
        const openBrackets = (repairedJson.match(/\[/g) || []).length;
        const closeBrackets = (repairedJson.match(/\]/g) || []).length;
        
        console.log(`📊 JSON structure: { open: ${openBraces}, close: ${closeBraces} }, [ open: ${openBrackets}, close: ${closeBrackets} ]`);
        
        // If truncated, close incomplete string and structures
        if (repairedJson.endsWith('"')) {
          // Already has closing quote
        } else if (!repairedJson.endsWith('}') && !repairedJson.endsWith(']')) {
          repairedJson += '"'; // Close unterminated string
        }
        
        // Close missing brackets and braces
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          repairedJson += ']';
        }
        for (let i = 0; i < openBraces - closeBraces; i++) {
          repairedJson += '}';
        }
        
        console.log('🔧 Attempting to parse repaired JSON...');
        const parsed = JSON.parse(repairedJson);
        console.log('✅ JSON parsed after repair');
        const cleaned = cleanRefinedContent(parsed);
        console.log('🧹 LaTeX formatting stripped from content');
        return cleaned;
      } catch (thirdError: any) {
        console.error('❌ All parsing attempts failed');
        console.error('📄 Original error:', firstError.message);
        console.error('📄 JSON preview (first 1000 chars):', jsonString.substring(0, 1000));
        console.error('📄 JSON preview (last 200 chars):', jsonString.substring(jsonString.length - 200));
        
        throw new Error(`Failed to parse AI response after 3 attempts: ${firstError.message}`);
      }
    }
  }
}
