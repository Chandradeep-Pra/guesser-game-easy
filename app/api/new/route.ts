import { NextRequest, NextResponse } from "next/server";

// IMPORTANT: Using NEXT_PUBLIC here exposes the key, ensure this is handled securely in a real app.
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// --- STEP 1: Define Schemas ---

// Schema for a single quiz question
const questionSchema = {
  type: "OBJECT",
  properties: {
    imageSearchQuery: { type: "STRING" },
    questionText: { type: "STRING" },
    correctAnswer: { type: "STRING" },
    options: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["imageSearchQuery", "questionText", "correctAnswer", "options"],
};

// Schema for multiple questions (array of 10)
const responseSchema = {
  type: "ARRAY",
  items: questionSchema,
  minItems: 10,
  maxItems: 10,
};

// --- STEP 2: CONCEPTUAL IMAGE FETCHING FUNCTION ---

// In a real application, this function would call an external API
// (e.g., Google Custom Search, Unsplash, Pexels) using the query to get a direct URL.
// utils/fetchImageUrl.ts

export async function fetchImageUrlFromSearchQuery(searchQuery: string) {
  const apiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

  if (!apiKey) {
    console.error("❌ PEXELS_API_KEY is missing in environment variables.");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: apiKey,
        },
        next: { revalidate: 86400 }, // ✅ cache results for 1 day (Next.js optimization)
      }
    );

    if (!res.ok) {
      console.error("❌ Pexels API error:", res.status, res.statusText);
      return null;
    }

    const data = await res.json();

    if (data.photos && data.photos.length > 0) {
      const photo = data.photos[0].src;

      // ✅ return the highest-quality URL
      return (
        photo.large2x || // 1920px wide HD
        photo.original || // full-size source image
        photo.large || // fallback
        photo.medium
      );
    } else {
      console.warn("⚠️ No image found for:", searchQuery);
      return null;
    }
  } catch (error) {
    console.error("💥 Error fetching image:", error);
    return null;
  }
}



// Helper function is no longer needed when using generationConfig, but kept for legacy:
// function cleanJsonString(text: string) {
//   return text.replace(/^```json\s*/, "").replace(/```$/, "").trim();
// }


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
    if (!countries || !category || !Array.isArray(countries) || countries.length < 0 || countries.length > 5) {
      return NextResponse.json(
        { error: "Invalid input. Requires a category string and an array of 3–5 countries." },
        { status: 400 }
      );
    }

    // System prompt instructing Gemini to generate exactly 10 questions
    const systemPrompt = `
You are a professional quiz generator.
Generate exactly 10 multiple-choice questions.
Each question must relate to the given category and exactly one country from the provided list.
The 'imageSearchQuery' field must contain a concise, high-quality search prompt for a relevant image.
DO NOT include any extra text, explanation, or Markdown outside the resulting JSON array.
`;

    const userQuery = `Create 10 quiz questions using:
- Category: ${category}
- Countries (Options): [${countries.join(", ")}]`;

    // 🛑 Re-enabling generationConfig for reliable JSON output, which is why we removed the conflicting 'tools' previously.
    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    };

    const apiUrl = `${API_BASE_URL}/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    // Retry logic
    let lastError: string | null = null;
    const maxRetries = 3;
    let quizData: any[] | null = null;

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
        // Since responseMimeType is set, the output is guaranteed to be clean JSON string
        const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonText) {
          lastError = "Gemini API response missing content or candidate failed.";
          continue;
        }

        try {
          // No need for cleanJsonString with generationConfig
          const parsedData = JSON.parse(jsonText);

          if (Array.isArray(parsedData) && parsedData.length === 10) {
            quizData = parsedData;
            break; // Successfully generated quiz data, exit retry loop
          } else {
            lastError = `Returned JSON does not contain exactly 10 questions.`;
          }
        } catch (e: any) {
          lastError = `LLM returned invalid JSON: ${e.message}. Raw output start: ${jsonText.substring(0, 200)}...`;
        }

      } catch (err: any) {
        lastError = `Fetch error: ${err.message}`;
      }
    }

    if (!quizData) {
       // If all retries fail
       console.error("Failed to generate quiz:", lastError);
       return NextResponse.json(
         { error: "Failed to generate 10 quiz questions from AI service.", detail: lastError },
         { status: 500 }
       );
    }
    
    // --- STEP 3: Fetch Images for Each Question (Sequential Fetching) ---
    
    const questionsWithImages = await Promise.all(
        quizData.map(async (question) => {
            const imageUrl = await fetchImageUrlFromSearchQuery(question.imageSearchQuery);
            return {
                ...question,
                imageUrl: imageUrl, // Add the new imageUrl field
            };
        })
    );

    return NextResponse.json(questionsWithImages, { status: 200 });

  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error during request processing.", detail: err.message },
      { status: 500 }
    );
  }
}
