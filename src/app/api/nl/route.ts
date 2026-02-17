import { NextRequest, NextResponse } from "next/server";
import { validateNLRequest, validateNLResponse } from "@/lib/nl-validation";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/nl-prompt";
import { callGemini, isGeminiConfigured } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isGeminiConfigured()) {
    return NextResponse.json(
      { type: "error", message: "Natural language features are not available. GEMINI_API_KEY is not configured." },
      { status: 503 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { type: "error", message: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateCheck.retryAfterMs ?? 60000) / 1000)) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { type: "error", message: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const validation = validateNLRequest(body);
  if (!validation.valid) {
    return NextResponse.json(
      { type: "error", message: "Invalid request", errors: validation.errors },
      { status: 400 }
    );
  }

  const { query, todos, timezone, currentTime } = validation.data;

  const systemPrompt = buildSystemPrompt(timezone, currentTime);
  const userPrompt = buildUserPrompt(query, todos);

  let rawText: string;
  try {
    rawText = await callGemini(systemPrompt, userPrompt);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { type: "error", message: `Failed to process your request: ${message}` },
      { status: 502 }
    );
  }

  // Strip markdown code fences if present
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { type: "error", message: "AI returned an invalid response. Please try again." },
      { status: 502 }
    );
  }

  const responseValidation = validateNLResponse(parsed);
  if (!responseValidation.valid) {
    return NextResponse.json(
      { type: "error", message: `AI returned an invalid response: ${responseValidation.error}` },
      { status: 502 }
    );
  }

  return NextResponse.json(responseValidation.data);
}
