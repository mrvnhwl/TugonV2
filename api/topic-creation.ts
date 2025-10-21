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
// AI REFINEMENT FUNCTION
// ========================================
async function refineWithGemini(submission: any) {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENAI_API_KEY not configured');
  }

  const terms = Array.isArray(submission.terms) ? submission.terms : JSON.parse(submission.terms);

  const refinementPrompt = `You are an expert mathematics educator creating content for high school to college students.

Refine this General Mathematics topic to make it educational and engaging:

**Title:** ${submission.title}
**About:** ${submission.about}
**Terms:** ${terms.join(', ')}

REQUIREMENTS:
1. Keep the title mostly the same (only minor improvements, add LaTeX if needed using $ for inline math)
2. Enhance the "about" description to be clear, engaging, and educational (2-3 well-structured paragraphs)
3. For EACH term provided, write a detailed explanation (150-250 words each) that includes:
   - Clear definition suitable for students
   - Mathematical examples with proper LaTeX formatting ($ for inline, $$ for display equations)
   - Real-world applications if relevant
   - Common mistakes to avoid

CRITICAL INSTRUCTIONS:
1. Respond ONLY with valid JSON (no markdown formatting, no code blocks, no extra text)
2. Use double backslashes for LaTeX in JSON strings (e.g., "\\\\frac{1}{2}" not "\\frac{1}{2}")
3. Provide explanations for ALL ${terms.length} terms

Required JSON format:
{
  "title": "Enhanced Title",
  "about_refined": "Enhanced multi-paragraph description with inline math like $f(x) = x^2$ where appropriate...",
  "terms_expounded": [
    {
      "term": "${terms[0]}",
      "explanation": "Detailed 150-250 word explanation with examples like $f(x) = \\\\sqrt{x}$ has domain $x \\\\geq 0$..."
    }
  ]
}`.trim();

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
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.95,
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
  console.log('📥 Gemini refinement response:', data);

  const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!aiText) {
    throw new Error('No response from Gemini AI');
  }

  const jsonMatch = aiText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('⚠️ Could not parse JSON from AI response:', aiText);
    throw new Error('Invalid AI response format');
  }

  return JSON.parse(jsonMatch[0]);
}
