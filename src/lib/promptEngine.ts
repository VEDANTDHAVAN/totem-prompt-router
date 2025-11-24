// lib/promptEngine.ts

export type Intent =
  | "Code generation / debugging"
  | "Content writing / copy"
  | "Analysis / reasoning"
  | "Data extraction / transformation"
  | "Brainstorming / ideation"
  | "Conversation / Q&A"
  | "Translation / localization"
  | "Unknown";

export type Domain =
  | "Software Engineering"
  | "Marketing / Copywriting"
  | "Business / Strategy"
  | "Education / Learning"
  | "Data / Analytics"
  | "General";

export type UseCase =
  | "Write code"
  | "Debug / fix code"
  | "Explain code"
  | "Summarize"
  | "Generate long-form content"
  | "Generate short-form content"
  | "Answer a question"
  | "Brainstorm ideas"
  | "Translate text"
  | "Classify / extract information"
  | "Compare / evaluate options"
  | "Unknown";

export type RecommendedModelId =
  | "gpt-4.1"
  | "o3-mini"
  | "claude-3.5-sonnet"
  | "gemini-1.5-pro"
  | "llama-3.1-70b";

export interface RecommendedModel {
  id: RecommendedModelId;
  name: string;
  provider: string;
  url: string;
  notes: string;
}

export interface AnalysisResult {
  intent: Intent;
  domain: Domain;
  useCase: UseCase;
  enhancedPrompt: string;
  model: RecommendedModel;
  followUps: string[];
}

/**
 * Very lightweight keyword-based inference.
 * No external APIs, just heuristics.
 */
export function inferIntentDomainUseCase(
  prompt: string
): {
  intent: Intent;
  domain: Domain;
  useCase: UseCase;
} {
  const p = prompt.toLowerCase();

  const hasAny = (...words: string[]) => words.some((w) => p.includes(w));

  // Software / code
  if (
    hasAny(
      "code",
      "function",
      "bug",
      "stack trace",
      "error",
      "typescript",
      "python",
      "javascript",
      "java",
      "c++",
      "refactor",
      "time complexity"
    )
  ) {
    if (hasAny("bug", "fix", "debug", "doesn't work", "doesnt work", "error")) {
      return {
        intent: "Code generation / debugging",
        domain: "Software Engineering",
        useCase: "Debug / fix code",
      };
    }
    if (hasAny("explain", "what does this code do")) {
      return {
        intent: "Code generation / debugging",
        domain: "Software Engineering",
        useCase: "Explain code",
      };
    }
    return {
      intent: "Code generation / debugging",
      domain: "Software Engineering",
      useCase: "Write code",
    };
  }

  // Translation
  if (
    hasAny(
      "translate",
      "translation",
      "in spanish",
      "in french",
      "in hindi",
      "in german"
    )
  ) {
    return {
      intent: "Translation / localization",
      domain: "General",
      useCase: "Translate text",
    };
  }

  // Summarization / analysis
  if (hasAny("summarize", "summary", "tl;dr", "tl; dr", "analyze", "analysis")) {
    if (hasAny("csv", "table", "data", "dataset", "json")) {
      return {
        intent: "Data extraction / transformation",
        domain: "Data / Analytics",
        useCase: "Summarize",
      };
    }
    return {
      intent: "Analysis / reasoning",
      domain: "Business / Strategy",
      useCase: "Summarize",
    };
  }

  // Comparison / decision
  if (hasAny("compare", "which is better", "pros and cons", "evaluate")) {
    return {
      intent: "Analysis / reasoning",
      domain: "Business / Strategy",
      useCase: "Compare / evaluate options",
    };
  }

  // Content / copy
  if (
    hasAny(
      "blog",
      "article",
      "essay",
      "story",
      "script",
      "instagram",
      "linkedin",
      "tweet",
      "x post",
      "caption",
      "ad copy",
      "landing page"
    )
  ) {
    const shortForm = hasAny("caption", "tweet", "x post", "hook", "headline");
    return {
      intent: "Content writing / copy",
      domain: "Marketing / Copywriting",
      useCase: shortForm
        ? "Generate short-form content"
        : "Generate long-form content",
    };
  }

  // Brainstorming
  if (
    hasAny(
      "ideas",
      "brainstorm",
      "suggest",
      "what are some ways",
      "give me some ways",
      "list of"
    )
  ) {
    return {
      intent: "Brainstorming / ideation",
      domain: "General",
      useCase: "Brainstorm ideas",
    };
  }

  // Q&A / tutoring
  if (
    hasAny(
      "explain",
      "what is",
      "how does",
      "why does",
      "teach me",
      "help me understand"
    )
  ) {
    return {
      intent: "Conversation / Q&A",
      domain: "Education / Learning",
      useCase: "Answer a question",
    };
  }

  // Fallback
  return {
    intent: "Unknown",
    domain: "General",
    useCase: "Unknown",
  };
}

/**
 * Map inferred intent/domain/useCase to a concrete LLM.
 * Purely heuristic, no external calls.
 */
export function recommendModel(params: {
  intent: Intent;
  domain: Domain;
  useCase: UseCase;
  promptLength: number;
}): RecommendedModel {
  const { intent, domain, useCase, promptLength } = params;

  const m = (id: RecommendedModelId): RecommendedModel => {
    switch (id) {
      case "gpt-4.1":
        return {
          id,
          name: "GPT-4.1",
          provider: "OpenAI",
          url: "https://chatgpt.com/",
          notes: "Strong for reasoning, coding, and mixed tasks.",
        };
      case "o3-mini":
        return {
          id,
          name: "o3-mini",
          provider: "OpenAI",
          url: "https://chatgpt.com/",
          notes: "Fast, cheap reasoning model for most everyday tasks.",
        };
      case "claude-3.5-sonnet":
        return {
          id,
          name: "Claude 3.5 Sonnet",
          provider: "Anthropic",
          url: "https://claude.ai/",
          notes: "Excellent for writing, editing, and long-context tasks.",
        };
      case "gemini-1.5-pro":
        return {
          id,
          name: "Gemini 1.5 Pro",
          provider: "Google",
          url: "https://gemini.google.com/app",
          notes: "Good for multilingual and multimodal use cases.",
        };
      case "llama-3.1-70b":
        return {
          id,
          name: "Llama 3.1 70B",
          provider: "Meta (via various hosts)",
          url: "https://llama.meta.com/",
          notes: "Open-source-friendly option; good overall model.",
        };
    }
  };

  // Coding → GPT-4.1
  if (intent === "Code generation / debugging") {
    return m("gpt-4.1");
  }

  // Content / writing → Claude 3.5 Sonnet
  if (intent === "Content writing / copy") {
    return m("claude-3.5-sonnet");
  }

  // Translation / multilingual → Gemini
  if (intent === "Translation / localization") {
    return m("gemini-1.5-pro");
  }

  // Data / analytics or compare/evaluate → GPT-4.1
  if (
    domain === "Data / Analytics" ||
    useCase === "Compare / evaluate options" ||
    useCase === "Classify / extract information"
  ) {
    return m("gpt-4.1");
  }

  // Short, simple prompts → o3-mini as fast default
  if (promptLength < 200) {
    return m("o3-mini");
  }

  // Long / complex → Claude 3.5 Sonnet
  return m("claude-3.5-sonnet");
}

/**
 * Build a structured enhanced prompt with:
 * - Role
 * - Context
 * - Task
 * - Constraints
 * - Style
 */
export function buildEnhancedPrompt(params: {
  originalPrompt: string;
  intent: Intent;
  domain: Domain;
  useCase: UseCase;
  model: RecommendedModel;
}): string {
  const { originalPrompt, intent, domain, useCase, model } = params;

  const role = (() => {
    if (domain === "Software Engineering")
      return "You are a senior software engineer and code reviewer.";
    if (domain === "Marketing / Copywriting")
      return "You are an expert marketing copywriter.";
    if (domain === "Business / Strategy")
      return "You are a strategy consultant.";
    if (domain === "Education / Learning")
      return "You are a patient teacher and subject matter expert.";
    if (domain === "Data / Analytics")
      return "You are a data analyst and statistician.";
    return "You are an expert helpful assistant.";
  })();

  const style = (() => {
    switch (intent) {
      case "Code generation / debugging":
        return "Use clear, step-by-step explanations and include commented code examples when helpful.";
      case "Content writing / copy":
        return "Use engaging, human-like language. Avoid being generic or overly robotic.";
      case "Analysis / reasoning":
        return "Think through the problem step by step and make your reasoning explicit.";
      case "Data extraction / transformation":
        return "Return results in clean, structured formats such as tables or JSON when appropriate.";
      default:
        return "Be concise but complete. Prefer clarity over verbosity.";
    }
  })();

  const constraints = [
    "If something is ambiguous, ask a brief clarifying question before assuming.",
    "If you need to make assumptions, state them explicitly first.",
    "Avoid hallucinating unsupported facts; say 'I’m not sure' when necessary.",
  ];

  return [
    `ROLE:\n${role}`,
    ``,
    `CONTEXT:\nThe user is asking for a task categorized as:\n- Intent: ${intent}\n- Domain: ${domain}\n- Use case: ${useCase}\n- Recommended model: ${model.name} (${model.provider})`,
    ``,
    `TASK:\nRespond to the following user request in the most helpful way possible:\n"""${originalPrompt.trim()}"""`,
    ``,
    `CONSTRAINTS:\n- ${constraints.join("\n- ")}`,
    ``,
    `STYLE:\n${style}`,
  ].join("\n");
}

/**
 * Suggest 2–3 follow-up prompts based on the original request and inferred use case.
 */
export function generateFollowUps(params: {
  originalPrompt: string;
  useCase: UseCase;
}): string[] {
  const { originalPrompt, useCase } = params;

  const base =
    originalPrompt.length > 120
      ? originalPrompt.slice(0, 120) + "..."
      : originalPrompt;

  switch (useCase) {
    case "Write code":
      return [
        "Can you explain this code line-by-line as if I'm a beginner?",
        "Suggest edge cases and tests I should add for this code.",
        "How can I improve the performance and readability of this solution?",
      ];
    case "Debug / fix code":
      return [
        "Show me a minimal reproducible example of the bug and the fixed version.",
        "Explain what was causing the bug in simple terms.",
        "Suggest best practices to avoid similar bugs in the future.",
      ];
    case "Generate long-form content":
      return [
        "Give me an outline for this piece before writing the full draft.",
        "Suggest 5 alternate headlines or titles for this content.",
        "Rewrite the draft in a more concise and punchy tone.",
      ];
    case "Generate short-form content":
      return [
        "Generate 3 alternative hooks or opening lines for this.",
        "Adapt this content for a different platform (e.g., LinkedIn instead of Instagram).",
        "Suggest 5 relevant hashtags or keywords.",
      ];
    case "Summarize":
      return [
        "Now provide a 1–2 sentence executive summary.",
        "Extract the key action items and responsibilities.",
        "List the main risks, open questions, and assumptions.",
      ];
    case "Compare / evaluate options":
      return [
        "Summarize your recommendation in a single paragraph for an executive audience.",
        "Create a decision matrix table comparing the options on key criteria.",
        "Highlight the top 3 risks or downsides of your recommended option.",
      ];
    case "Translate text":
      return [
        "Now provide a more informal, conversational version of this translation.",
        "Highlight any phrases that don't translate directly and explain your choices.",
        "Check the translation for tone and politeness level in the target culture.",
      ];
    case "Answer a question":
      return [
        "Explain this again using a real-world analogy.",
        "What are the most common misconceptions related to this topic?",
        "Give me a short quiz (5 questions) to test my understanding.",
      ];
    case "Brainstorm ideas":
      return [
        "Cluster these ideas into 3–5 themes and label them.",
        "Prioritize the top 5 ideas based on impact vs. effort.",
        "Turn the best idea into a concrete step-by-step plan.",
      ];
    default:
      return [
        `What clarifying questions would you ask to better answer: "${base}"?`,
        "Suggest a more specific version of my original prompt to get a better answer.",
        "Generate an improved version of my prompt that adds useful context.",
      ];
  }
}

/**
 * Optional: end-to-end pipeline usable on client side (heuristic only).
 * The API route uses the same pieces but can override the classification with LLMs.
 */
export function analyzePrompt(prompt: string): AnalysisResult {
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

  return {
    intent,
    domain,
    useCase,
    enhancedPrompt,
    model,
    followUps,
  };
}
