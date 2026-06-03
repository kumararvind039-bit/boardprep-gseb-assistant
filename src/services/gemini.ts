import { GoogleGenAI } from "@google/genai";

export const geminiModel = "gemini-2.5-flash";

export function getApiKey(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('GEMINI_API_KEY');
    if (stored) return stored;
  }
  return process.env.GEMINI_API_KEY || "";
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

function getAIInstance() {
  const apiKey = getApiKey();
  return new GoogleGenAI({ apiKey });
}

export async function generateSocraticResponse(content: string, userQuestion: string, chatHistory: { role: 'user' | 'model', text: string }[]) {
  const systemInstruction = `
    You are a Socratic Tutor for GSEB Class 10 students (Gujarat Board, English Medium). 
    Your goal is to help students understand concepts by asking probing questions rather than giving direct answers.
    Use the provided context (student's notes/textbook) to guide them.
    Keep your tone encouraging and syllabus-specific.
    If the student asks for a direct answer, gently redirect them to think about a specific part of the concept first.
    Context: ${content}
  `;

  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: [
      ...chatHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
      { role: 'user', parts: [{ text: userQuestion }] }
    ],
    config: {
      systemInstruction,
    },
  });

  return response.text;
}

export async function generateQuiz(content: string, subject: string) {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Generate a 5-question multiple choice quiz based on this Class 10 ${subject} content: ${content}. 
    Return the response in JSON format.
    Schema:
    {
      "questions": [
        {
          "id": "string",
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": number (0-3),
          "explanation": "string"
        }
      ]
    }`,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateFlashcards(content: string, subject: string) {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Generate 5 flashcards for Class 10 ${subject} based on this content: ${content}. 
    Focus on key definitions, formulas, or dates.
    Return the response in JSON format.
    Schema:
    {
      "flashcards": [
        {
          "id": "string",
          "question": "string",
          "answer": "string"
        }
      ]
    }`,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateSummary(content: string) {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Summarize this Class 10 study material into a concise, scannable format with bullet points. Focus on what's important for board exams. Content: ${content}`,
  });

  return response.text;
}

export async function gradeHandwrittenAnswer(imageB64: string, mimeType: string, questionPrompt: string) {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `You are an official GSEB (Gujarat Board) Class 10 Board Examiner grading a student's handwritten answer sheet (English Medium).

Analyze the attached photo of the student's handwritten answer.

Grading Instructions:
1. Provide a numerical score (e.g. 3 out of 4 marks) based strictly on GSEB Class 10 assessment standards (which require point-wise answers, key terminology inclusion, correct diagrams/formulations).
2. Assess the handwriting legibility, presentation, and formatting structure.
3. Detail the specific strengths and weaknesses of this answer.
4. Give a "GSEB Board Exemplar Model Answer" showing exactly how the student should rewrite this answer to score 100% full marks in their Board Exam (using proper formatting, bullet points, and highlighting key terms as GSEB examiners look for).

Context / Question that the student was attempting to answer:
"${questionPrompt}"`
          },
          {
            inlineData: {
              data: imageB64,
              mimeType: mimeType
            }
          }
        ]
      }
    ]
  });

  return response.text;
}

export async function generatePYQVariations(subject: string, chapter: string, question: string) {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `You are an expert GSEB (Gujarat Secondary and Higher Secondary Education Board) tutor.
    We need 4 similar practice questions (variations) based on this past year board exam question:
    Subject: ${subject}
    Chapter: ${chapter}
    Question: "${question}"

    Instructions:
    1. Generate exactly 4 questions that test the same concept, difficulty level, and skills.
    2. For each question, provide a detailed model answer conforming to GSEB criteria:
       - For Mathematics: Show clear step-by-step algebraic steps, formula references, calculations, and the final answer box.
       - For Science, Social Science, and English: Provide clear point-wise answers, highlighting critical vocabulary terms or definitions.
    3. Return the response in JSON format matching the schema below.

    Schema:
    {
      "variations": [
        {
          "question": "string (the practice question)",
          "answer": "string (detailed GSEB model answer with proper formatting, step-by-step for maths or point-wise for others)"
        }
      ]
    }`,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini", e);
    return { variations: [] };
  }
}

export async function generateSVGDiagram(prompt: string, subject: string, chapter: string) {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `You are an expert educational diagram designer for Class 10 learning apps.
    Create a clean, beautiful, self-contained SVG diagram based on the student's request:
    Subject: ${subject}
    Chapter: ${chapter}
    Visual Request: "${prompt}"

    Instructions:
    1. Draw a high-quality vector diagram or line chart explaining the concepts.
    2. Use crisp lines, curves, axes, markers, and text annotations for educational clarity.
    3. Use a modern, light-theme palette: strokes and fills in colors like slate/gray for structures, indigo/sky-blue for rays or functions, emerald/amber for emphasis.
    4. Provide the result in JSON format wrapping the raw SVG code.
    5. Ensure the SVG has viewBox="0 0 500 300" and width="100%" height="100%".
    6. Double check that the SVG contains valid, self-contained XML markup without any HTML wrap, and properly closed tags.

    Schema:
    {
      "svg": "string (valid SVG XML content starting with <svg> and ending with </svg>)"
    }`,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    const data = JSON.parse(response.text || "{}");
    // Strip markdown wrappers if any crept in
    let svg = data.svg || "";
    if (svg.includes("```xml")) {
      svg = svg.split("```xml")[1].split("```")[0];
    } else if (svg.includes("```html")) {
      svg = svg.split("```html")[1].split("```")[0];
    } else if (svg.includes("```")) {
      svg = svg.split("```")[1].split("```")[0];
    }
    return { svg: svg.trim() };
  } catch (e) {
    console.error("Failed to generate SVG diagram", e);
    return { svg: `<svg viewBox="0 0 500 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#64748b">Visual not available. Please try again.</text></svg>` };
  }
}

export async function explainConceptSocratic(subject: string, chapter: string, concept: string, doubt?: string) {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `You are a Socratic audio tutor for a leading Class 10 tuition app. 
    Explain this concept: "${concept}" for Chapter: "${chapter}" (${subject}).
    ${doubt ? `The student has this doubt: "${doubt}". Answer this doubt.` : `Introduce this concept to the student beforehand.`}

    Instructions:
    1. Keep the spoken explanation concise, highly interactive, and non-verbose (under 80 words).
    2. Guide the student using a Socratic method—ask them an engaging question at the end to make them think.
    3. Return a JSON object with:
       - "explanationText": Scannable bullet points of the core concept to show on screen. Use proper markdown headers and lists.
       - "audioScript": The conversational text to be read out loud using text-to-speech.

    Schema:
    {
      "explanationText": "string (point-wise text for display)",
      "audioScript": "string (conversational script for TTS audio)"
    }`,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to explain concept", e);
    return {
      explanationText: `### ${concept}\n\n• Reference standard textbooks to study details.\n• Tap "Listen" to hear voice-over explanations.\n• Speak or type your doubts to discuss.`,
      audioScript: `Let's look at this concept. What are your first thoughts on this topic?`
    };
  }
}




