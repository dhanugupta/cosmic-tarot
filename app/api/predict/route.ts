import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { generatePrompt } from "@/lib/prompts/generatePrompt";
import { getMockReading } from "@/lib/mocks/mockReading";
import type { ReadingPrompt } from "@/lib/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ENABLE_MOCK = process.env.ENABLE_MOCK === 'true' || process.env.ENABLE_MOCK === '1';
const MAX_READINGS_PER_DAY = 3;

// In-memory store for reading counts (in production, use a database or Redis)
// Key format: "YYYY-MM-DD:identifier" where identifier could be IP, user ID, etc.
const readingCounts = new Map<string, { count: number; timestamps: number[] }>();

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get identifier from request (IP address or user agent hash)
 */
function getRequestIdentifier(request: NextRequest): string {
  // Try to get IP address
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'anonymous';
  return ip.split(',')[0].trim();
}

/**
 * Check if reading is allowed for this request
 */
function canPerformReading(identifier: string): { allowed: boolean; remaining: number; resetTime?: number } {
  const today = getTodayDate();
  const key = `${today}:${identifier}`;
  
  const record = readingCounts.get(key) || { count: 0, timestamps: [] };
  
  if (record.count >= MAX_READINGS_PER_DAY) {
    // Calculate time until next midnight UTC
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: tomorrow.getTime()
    };
  }
  
  return {
    allowed: true,
    remaining: MAX_READINGS_PER_DAY - record.count
  };
}

/**
 * Record a reading for this request
 */
function recordReading(identifier: string): void {
  const today = getTodayDate();
  const key = `${today}:${identifier}`;
  
  const record = readingCounts.get(key) || { count: 0, timestamps: [] };
  record.count += 1;
  record.timestamps.push(Date.now());
  
  readingCounts.set(key, record);
  
  // Clean up old records (older than 1 day)
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  for (const [mapKey] of readingCounts.entries()) {
    if (mapKey.startsWith(yesterdayStr)) {
      readingCounts.delete(mapKey);
    }
  }
}

// Use gemini-2.5-flash (latest model)
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(request: NextRequest) {
  // Get request identifier for rate limiting
  const identifier = getRequestIdentifier(request);
  
  // Check reading limit (skip for mock mode)
  if (!ENABLE_MOCK) {
    const limitCheck = canPerformReading(identifier);
    if (!limitCheck.allowed) {
      const resetTime = limitCheck.resetTime ? new Date(limitCheck.resetTime).toISOString() : null;
      console.log(`❌ Reading limit exceeded for ${identifier}. Remaining: ${limitCheck.remaining}`);
      return NextResponse.json(
        { 
          error: "Daily reading limit reached",
          message: `You have reached the daily limit of ${MAX_READINGS_PER_DAY} readings. Please try again tomorrow.`,
          remaining: 0,
          resetTime
        },
        { status: 429 }
      );
    }
  }

  // Check if mock mode is enabled
  if (ENABLE_MOCK) {
    console.log("🎭 MOCK MODE ENABLED - Returning mock reading");
    try {
      const body = await request.json();
      const { prompt } = body;

      if (!prompt) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate mock reading
      const mockReading = getMockReading(
        prompt.userName || 'Seeker',
        prompt.past || 'Unknown Card',
        prompt.present || 'Unknown Card',
        prompt.future || 'Unknown Card'
      );

      // Return as JSON string (matching real API format)
      const mockResponse = JSON.stringify(mockReading);
      
      console.log("✅ Mock reading generated successfully");
      return NextResponse.json({ text: mockResponse });
    } catch (error) {
      console.error("Error in mock mode:", error);
      return NextResponse.json(
        { error: "Failed to generate mock reading" },
        { status: 500 }
      );
    }
  }

  // Validate API key (only needed in real mode)
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "API key not configured. Please set GEMINI_API_KEY environment variable." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    console.log("=== DEBUG: Incoming request ===");
    console.log("Request body:", JSON.stringify(body, null, 2));
    
    const { prompt } = body;

    if (!prompt) {
      console.error("=== DEBUG: Missing prompt in request ===");
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    
    console.log("Prompt object:", JSON.stringify(prompt, null, 2));

    // Generate the prompt text
    const promptText = generatePrompt({
      userName: prompt.userName,
      currentMood: prompt.currentMood,
      currentContext: prompt.currentContext,
      pastCard: prompt.past,
      presentCard: prompt.present,
      futureCard: prompt.future,
      currentReadingType: prompt.currentReadingType,
    });

    console.log("=== DEBUG: Request to Google API ===");
    console.log("Prompt length:", promptText.length);
    console.log("Prompt preview (first 500 chars):", promptText.substring(0, 500));
    console.log("User name:", prompt.userName);
    console.log("Cards:", { past: prompt.past, present: prompt.present, future: prompt.future });

    // Initialize the Google Generative AI client with the new SDK
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });
    
    // Try different models - the API version may affect which models are available
    // Start with the most recent models first
    const modelNamesToTry = [
      "gemini-2.5-flash",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-1.0-pro",
      "gemini-pro"
    ];

    let response;
    let lastError: Error | null = null;
    let usedModel = "";

    // Try each model until one works
    for (const modelName of modelNamesToTry) {
      try {
        console.log(`\n=== DEBUG: Attempting to use model: ${modelName} ===`);
        
        const requestConfig = {
          model: modelName,
          contents: promptText,
          config: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096, // Increased to allow complete tarot readings
          },
        };
        
        console.log("Request config:", JSON.stringify(requestConfig, null, 2));
        
        // Use the new SDK pattern
        response = await ai.models.generateContent(requestConfig);
        
        console.log("\n=== DEBUG: Response received ===");
        console.log("Response type:", typeof response);
        console.log("Response keys:", Object.keys(response || {}));
        console.log("Full response:", JSON.stringify(response, null, 2));
        console.log("Response.text:", response?.text);
        console.log("Response.text type:", typeof response?.text);
        console.log("Response.text length:", response?.text?.length);
        
        usedModel = modelName;
        console.log(`✅ Successfully using model: ${modelName}`);
        break;
      } catch (err) {
        console.error(`❌ Model ${modelName} failed:`, err);
        if (err instanceof Error) {
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
        }
        lastError = err instanceof Error ? err : new Error(String(err));
        // Continue to next model
        continue;
      }
    }

    if (!response) {
      const errorMsg = lastError?.message || 'Unknown error';
      console.error("=== DEBUG: All models failed ===");
      console.error("Last error:", lastError);
      throw new Error(`All models failed. Last error: ${errorMsg}. Please check your API key and model availability.`);
    }

    // Extract text from response
    // The new SDK returns text directly
    console.log("\n=== DEBUG: Extracting text from response ===");
    console.log("Response object:", response);
    console.log("Response type:", typeof response);
    console.log("Response constructor:", (response as any)?.constructor?.name);
    console.log("Response keys:", Object.keys(response || {}));
    
    // Try different ways to access the text
    // Cast to any to check multiple possible response structures
    const responseAny = response as any;
    let generatedText: string | undefined;
    
    // Method 1: Direct text property
    if (responseAny?.text) {
      generatedText = responseAny.text;
      console.log("✅ Found text via response.text");
    }
    // Method 2: response.response.text()
    else if (responseAny?.response?.text) {
      generatedText = typeof responseAny.response.text === 'function' 
        ? responseAny.response.text() 
        : responseAny.response.text;
      console.log("✅ Found text via response.response.text");
    }
    // Method 3: candidates[0].content.parts[0].text
    else if (responseAny?.candidates?.[0]?.content?.parts?.[0]?.text) {
      generatedText = responseAny.candidates[0].content.parts[0].text;
      console.log("✅ Found text via candidates[0].content.parts[0].text");
    }
    // Method 4: response.data or response.result
    else if (responseAny?.data?.text) {
      generatedText = responseAny.data.text;
      console.log("✅ Found text via response.data.text");
    }
    else if (responseAny?.result?.text) {
      generatedText = responseAny.result.text;
      console.log("✅ Found text via response.result.text");
    }
    // Method 5: Try to stringify and parse
    else {
      console.log("⚠️ Trying to inspect full response structure...");
      const responseStr = JSON.stringify(response, null, 2);
      console.log("Full response JSON:", responseStr);
      
      // Try to find any text-like properties
      for (const key in responseAny) {
        if (typeof responseAny[key] === 'string' && responseAny[key].length > 100) {
          console.log(`Found potential text in key "${key}":`, responseAny[key].substring(0, 200));
        }
      }
    }
    
    console.log("Generated text:", generatedText);
    console.log("Generated text type:", typeof generatedText);
    console.log("Generated text length:", generatedText?.length);

    if (!generatedText || (typeof generatedText === 'string' && generatedText.trim().length === 0)) {
      console.error("=== DEBUG: Empty response detected ===");
      console.error("Generated text value:", generatedText);
      console.error("Generated text type:", typeof generatedText);
      console.error("Full response object:", JSON.stringify(response, null, 2));
      return NextResponse.json(
        { error: "Generated content is empty. Check server logs for details." },
        { status: 500 }
      );
    }

    console.log("\n=== DEBUG: Returning response ===");
    console.log("Final text length:", typeof generatedText === 'string' ? generatedText.length : 'N/A');
    console.log("Final text preview:", typeof generatedText === 'string' ? generatedText.substring(0, 200) : generatedText);

    // Clean up the response - remove markdown code blocks if present and validate JSON
    let cleanedText = generatedText;
    if (typeof cleanedText === 'string') {
      // Remove markdown code blocks (```json ... ``` or ``` ... ```)
      cleanedText = cleanedText.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');
      // Remove any leading/trailing whitespace or newlines
      cleanedText = cleanedText.trim();
      
      // Try to parse as JSON to validate it's valid JSON
      try {
        const parsed = JSON.parse(cleanedText);
        console.log("✅ Response is valid JSON");
        
        // Check if JSON is complete (has all required fields)
        if (!parsed.combined_meaning || !parsed.closing_message) {
          console.warn("⚠️ JSON appears incomplete - missing some fields");
          console.warn("Has combined_meaning:", !!parsed.combined_meaning);
          console.warn("Has closing_message:", !!parsed.closing_message);
        }
        
        // Return the parsed JSON object directly (not stringified)
        // The frontend expects a JSON string, so we'll stringify it
        cleanedText = JSON.stringify(parsed);
      } catch (parseError) {
        console.error("⚠️ Response is not valid JSON, attempting to extract JSON...");
        console.error("Parse error:", parseError);
        console.error("Response length:", cleanedText.length);
        console.error("Response ends with:", cleanedText.substring(Math.max(0, cleanedText.length - 100)));
        
        // Check if response was truncated
        if (cleanedText.includes('"combined_meaning"') && !cleanedText.includes('"closing_message"')) {
          console.error("❌ Response appears to be truncated - missing closing_message");
          throw new Error("AI response was truncated. The reading is incomplete. Please try again.");
        }
        
        // Try to extract JSON from the text if it's embedded
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            cleanedText = JSON.stringify(parsed);
            console.log("✅ Extracted valid JSON from response");
          } catch (e) {
            console.error("❌ Could not extract valid JSON:", e);
            throw new Error("Failed to parse AI response. The response may be incomplete or malformed.");
          }
        } else {
          throw new Error("No valid JSON found in AI response. The response may be incomplete.");
        }
      }
      
      console.log("Cleaned text length:", cleanedText.length);
      console.log("Cleaned text preview:", cleanedText.substring(0, 200));
    }

    // Record the reading (only if not mock mode)
    if (!ENABLE_MOCK) {
      recordReading(identifier);
      const limitCheck = canPerformReading(identifier);
      console.log(`✅ Reading recorded for ${identifier}. Remaining: ${limitCheck.remaining}`);
    }

    // Return the cleaned generated text as a JSON string
    // The frontend will parse this string to get the JSON object
    return NextResponse.json({ 
      text: cleanedText,
      remaining: !ENABLE_MOCK ? canPerformReading(identifier).remaining : MAX_READINGS_PER_DAY
    });

  } catch (error) {
    // Enhanced error handling
    console.error("Error generating tarot reading:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API_KEY")) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your GEMINI_API_KEY." },
          { status: 401 }
        );
      }
      if (error.message.includes("quota") || error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "API quota exceeded. Please try again later." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Failed to generate reading: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch reading. Please try again." },
      { status: 500 }
    );
  }
}

