// app/api/ashan/route.ts
import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Structured JSON schema for the quiz
const responseSchema = {
  type: "OBJECT",
  properties: {
    imageSearchQuery: { type: "STRING" },
    questionText: { type: "STRING" },
    correctAnswer: { type: "STRING" },
    options: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["imageSearchQuery", "questionText", "correctAnswer", "options"]
};

export async function POST(req: NextRequest) {
  // 1️⃣ Check for API Key
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY environment variable is not set." },
      { status: 500 }
    );
  }

  try {
    // 2️⃣ Parse JSON body
    const body = await req.json();
    const { countries, category } = body;

    // 3️⃣ Input Validation
    if (
      !countries ||
      !category ||
      !Array.isArray(countries) ||
      countries.length < 3 ||
      countries.length > 5
    ) {
      return NextResponse.json(
        {
          error: "Invalid input. Requires a category string and an array of 3–5 countries."
        },
        { status: 400 }
      );
    }

    // Convert schema to string for clarity in prompt
    const schemaString = JSON.stringify(responseSchema, null, 2);

    // 4️⃣ Define LLM prompts
    const systemPrompt = `
      You are a professional quiz generator.
      Generate a multiple-choice question strictly in JSON format in.
      The question must relate to the given category and exactly one country from the provided list.
      The output MUST be a JSON object strictly following this schema:

      ${schemaString}

      'imageSearchQuery' should be a concise prompt to search for an image representing the correct answer.
      DO NOT include any text or markdown outside of the JSON object.
    `;

    const userQuery = `Create a quiz question using the following details:
    - Category: ${category}
    - Countries (Options): [${countries.join(", ")}]`;

    // 5️⃣ Construct Gemini API payload (without tools)
    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const apiUrl = `${API_BASE_URL}/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    // 6️⃣ Retry logic
    let lastError: string | null = null;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }

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
        const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonText) {
          lastError = "Gemini API response missing content or candidate failed.";
          continue;
        }

        try {
          const quizData = JSON.parse(jsonText);
          return NextResponse.json(quizData, { status: 200 });
        } catch (e) {
          lastError = `LLM returned invalid JSON: ${jsonText.substring(0, 100)}...`;
        }
      } catch (err: any) {
        lastError = `Fetch error: ${err.message}`;
      }
    }

    // 7️⃣ If all retries fail
    console.error("Failed to generate quiz:", lastError);
    return NextResponse.json(
      {
        error: "Failed to generate quiz question from AI service after multiple retries.",
        detail: lastError
      },
      { status: 500 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error during request processing.", detail: err.message },
      { status: 500 }
    );
  }
}
