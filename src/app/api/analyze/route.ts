// app/api/analyze/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  AnalysisResult,
  Intent,
  Domain,
  UseCase,
  inferIntentDomainUseCase,
  recommendModel,
  buildEnhancedPrompt,
  generateFollowUps,
} from "@/lib/promptEngine";

// Ensure Node runtime (not edge) for the SDK
export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid `prompt` in request body." },
        { status: 400 }
      );
    }

    // 1) No API key → pure heuristic fallback (no cost, always works)
    if (!process.env.OPENAI_API_KEY) {
      const result = runHeuristicPipeline(prompt);
      return NextResponse.json(result);
    }

    // 2) LLM-based classification using Responses API
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You classify user prompts into `intent`, `domain`, and `useCase` for a prompt router. " +
            "Return ONLY JSON matching the given schema; no extra text.",
        },
        {
          role: "user",
          content:
            `Classify the following prompt:\n` +
            `"""${prompt}"""\n\n` +
            `Use these allowed values:\n` +
            `intent (required): one of [\n` +
            `  "Code generation / debugging",\n` +
            `  "Content writing / copy",\n` +
            `  "Analysis / reasoning",\n` +
            `  "Data extraction / transformation",\n` +
            `  "Brainstorming / ideation",\n` +
            `  "Conversation / Q&A",\n` +
            `  "Translation / localization",\n` +
            `  "Unknown"\n` +
            `]\n` +
            `domain (required): one of [\n` +
            `  "Software Engineering",\n` +
            `  "Marketing / Copywriting",\n` +
            `  "Business / Strategy",\n` +
            `  "Education / Learning",\n` +
            `  "Data / Analytics",\n` +
            `  "General"\n` +
            `]\n` +
            `useCase (required): one of [\n` +
            `  "Write code",\n` +
            `  "Debug / fix code",\n` +
            `  "Explain code",\n` +
            `  "Summarize",\n` +
            `  "Generate long-form content",\n` +
            `  "Generate short-form content",\n` +
            `  "Answer a question",\n` +
            `  "Brainstorm ideas",\n` +
            `  "Translate text",\n` +
            `  "Classify / extract information",\n` +
            `  "Compare / evaluate options",\n` +
            `  "Unknown"\n` +
            `]`,
        },
      ],
      // This matches the structured-output pattern from the docs
      text: {
        format: {
          type: "json_object",
        },
      },
    });

    // According to the Responses docs:
    // - free-form text lives at response.output[0].content[0].text
    // - structured outputs (JSON) live at response.output[0].content[0].json
    //   :contentReference[oaicite:2]{index=2}
    let intent: Intent | undefined;
    let domain: Domain | undefined;
    let useCase: UseCase | undefined;

    try {
      const firstOutput = (response as any).output?.[0];
      const firstContent = firstOutput?.content?.[0];
      const jsonText =
        firstContent?.type === "output_text" ? firstContent.text : null;

      if (jsonText && typeof jsonText === "string") {
        const parsed = JSON.parse(jsonText) as {
          intent?: string;
          domain?: string;
          useCase?: string;
        };

        intent = parsed.intent as Intent | undefined;
        domain = parsed.domain as Domain | undefined;
        useCase = parsed.useCase as UseCase | undefined;
      }
    } catch (parseErr) {
      console.warn("Failed to parse JSON classification, falling back:", parseErr);
    }

    // 3) Safety net: if anything is missing → heuristic pipeline
    if (!intent || !domain || !useCase) {
      const result = runHeuristicPipeline(prompt);
      return NextResponse.json(result);
    }

    // 4) Feed into your existing routing pipeline
    const model = recommendModel({
      intent,
      domain,
      useCase,
      promptLength: prompt.length,
    });

    const enhancedPrompt = buildEnhancedPrompt({
      originalPrompt: prompt,
      intent,
      domain,
      useCase,
      model,
    });

    const followUps = generateFollowUps({ originalPrompt: prompt, useCase });

    const result: AnalysisResult = {
      intent,
      domain,
      useCase,
      enhancedPrompt,
      model,
      followUps,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/analyze:", error);
    return NextResponse.json(
      { error: "Internal server error while analyzing prompt." },
      { status: 500 }
    );
  }
}

// Shared heuristic pipeline so we can fall back cleanly
function runHeuristicPipeline(prompt: string): AnalysisResult {
  const { intent, domain, useCase } = inferIntentDomainUseCase(prompt);
  const model = recommendModel({
    intent,
    domain,
    useCase,
    promptLength: prompt.length,
  });
  const enhancedPrompt = buildEnhancedPrompt({
    originalPrompt: prompt,
    intent,
    domain,
    useCase,
    model,
  });
  const followUps = generateFollowUps({ originalPrompt: prompt, useCase });

  return { intent, domain, useCase, enhancedPrompt, model, followUps };
}