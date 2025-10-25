// app/api/ashan/route.ts
import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Schema for a single quiz question
const questionSchema = {
  type: "OBJECT",
  properties: {
    imageSearchQuery: { type: "STRING" },
    questionText: { type: "STRING" },
    correctAnswer: { type: "STRING" },
    options: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["imageSearchQuery", "questionText", "correctAnswer", "options"]
};

// Schema for multiple questions (array of 10)
const responseSchema = {
  type: "ARRAY",
  items: questionSchema,
  minItems: 10,
  maxItems: 10
};

// Helper to clean Markdown code fences
function cleanJsonString(text: string) {
  return text.replace(/^```json\s*/, "").replace(/```$/, "").trim();
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY environment variable is not set." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { countries, category } = body;

    // Input validation
    if (!countries || !category || !Array.isArray(countries) || countries.length < 3 || countries.length > 5) {
      return NextResponse.json(
        { error: "Invalid input. Requires a category string and an array of 3–5 countries." },
        { status: 400 }
      );
    }

    const schemaString = JSON.stringify(responseSchema, null, 2);

    // System prompt instructing Gemini to generate exactly 10 questions
    const systemPrompt = `
You are a professional quiz generator.
Generate exactly 10 multiple-choice questions in JSON format.
Each question must relate to the given category and exactly one country from the provided list.
Each question object must include:
- imageSearchQuery: concise prompt to search an image representing the correct answer.
- questionText: the question text.
- correctAnswer: the correct option.
- options: array of 3 countries including the correct answer.

The output MUST strictly follow this JSON schema:
${schemaString}

DO NOT include any extra text, explanation, or Markdown outside the JSON array.
`;

    const userQuery = `Create 10 quiz questions using:
- Category: ${category}
- Countries (Options): [${countries.join(", ")}]`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const apiUrl = `${API_BASE_URL}/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    // Retry logic
    let lastError: string | null = null;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));

      try {
        const apiResponse = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
          const errorDetail = await apiResponse.text();
          lastError = `Gemini API HTTP error: ${apiResponse.status} ${apiResponse.statusText}. Detail: ${errorDetail.substring(0, 100)}`;
          continue;
        }

        const result = await apiResponse.json();
        let jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonText) {
          lastError = "Gemini API response missing content or candidate failed.";
          continue;
        }

        // Clean Markdown fences
        jsonText = cleanJsonString(jsonText);

        try {
          const quizData = JSON.parse(jsonText);

          if (Array.isArray(quizData) && quizData.length === 10) {
            return NextResponse.json(quizData, { status: 200 });
          } else {
            lastError = `Returned JSON does not contain exactly 10 questions. Received ${quizData.length} questions.`;
          }
        } catch (e: any) {
          lastError = `LLM returned invalid JSON after cleaning: ${jsonText.substring(0, 200)}...`;
        }

      } catch (err: any) {
        lastError = `Fetch error: ${err.message}`;
      }
    }

    // If all retries fail
    console.error("Failed to generate quiz:", lastError);
    return NextResponse.json(
      { error: "Failed to generate 10 quiz questions from AI service.", detail: lastError },
      { status: 500 }
    );

  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error during request processing.", detail: err.message },
      { status: 500 }
    );
  }
}