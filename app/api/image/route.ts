// app/api/quiz-with-images/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const OPENAI_KEY = process.env.OPENAI_KEY || "";
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Schema for a single quiz question
const questionSchema = {
  type: "OBJECT",
  properties: {
    imageSearchQuery: { type: "STRING" },
    imageUrl: { type: "STRING" },
    questionText: { type: "STRING" },
    correctAnswer: { type: "STRING" },
    options: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["imageSearchQuery", "imageUrl", "questionText", "correctAnswer", "options"]
};

// Helper to clean Markdown fences
function cleanJsonString(text: string) {
  return text.replace(/^```json\s*/, "").replace(/```$/, "").trim();
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set." }, { status: 500 });
  }
  if (!OPENAI_KEY) {
    return NextResponse.json({ error: "OPENAI_KEY is not set." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { countries, category } = body;

    if (!countries || !category || !Array.isArray(countries) || countries.length < 3 || countries.length > 5) {
      return NextResponse.json({ error: "Provide a category string and 3-5 countries." }, { status: 400 });
    }

    // 1️⃣ Generate 10 quiz questions via Gemini
    const systemPrompt = `
You are a professional quiz generator.
Generate exactly 10 multiple-choice questions in JSON format.
Each question must relate to the category and one of the countries provided.
Each object must include:
- imageSearchQuery
- questionText
- correctAnswer
- options (3 countries including correct answer)
Output MUST strictly follow JSON array.
`;

    const userQuery = `Create 10 quiz questions using:
- Category: ${category}
- Countries: [${countries.join(", ")}]`;

    const geminiPayload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const geminiUrl = `${API_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload)
    });

    if (!geminiRes.ok) {
      const detail = await geminiRes.text();
      throw new Error(`Gemini API failed: ${detail.substring(0, 200)}`);
    }

    const geminiJson = await geminiRes.json();
    let jsonText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) throw new Error("Gemini API returned empty content.");
    jsonText = cleanJsonString(jsonText);

    const quizData: any[] = JSON.parse(jsonText);

    if (!Array.isArray(quizData) || quizData.length !== 10) {
      throw new Error("Gemini API did not return exactly 10 questions.");
    }

    // 2️⃣ Generate images using OpenAI for each question
    const openai = new OpenAI({ apiKey: OPENAI_KEY });

    for (const q of quizData) {
      try {
        const imgRes = await openai.images.generate({
          model: "gpt-image-1",
          prompt: q.imageSearchQuery,
          size: "512x512"
        });
        q.imageUrl = imgRes.data[0]?.url || "";
      } catch (err: any) {
        console.error("Image generation failed for:", q.imageSearchQuery, err);
        q.imageUrl = "";
      }
    }

    return NextResponse.json(quizData, { status: 200 });
  } catch (err: any) {
    console.error("Quiz with images error:", err);
    return NextResponse.json({ error: "Internal server error", detail: err.message }, { status: 500 });
  }
}


