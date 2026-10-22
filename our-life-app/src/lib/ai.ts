import Anthropic from "@anthropic-ai/sdk";
import type { AiSuggestion } from "./types";

const AI_TIMEOUT_MS = 6000;

const SYSTEM_PROMPT = `You help a married couple make invisible mental load visible, without blame or surveillance.

Given a short note describing something on someone's mind, respond with ONLY a JSON object (no markdown, no commentary) with these exact keys:
- "outcome": a short, calm description of what "resolved" would look like (string)
- "nextStep": the single most useful next action, concrete and small (string)
- "suggestedDate": a short natural-language suggested timeframe, e.g. "within 2 days" or "before end of month" (string)
- "suggestedOwner": one of exactly "creator", "partner", "together", "not_agreed" - never guess based on gender or stereotypes, default to "not_agreed" unless the text clearly names who should act
- "neutralShareText": a short, warm, non-accusatory sentence the person could use to share this with their partner, rewording any blame or frustration out of it

Rules:
- Never assign blame, never imply laziness or incompetence.
- Never diagnose anxiety or relationship issues.
- Keep language neutral: "on your mind", "needs agreement", not "task" or "deadline".
- If the note already sounds neutral, neutralShareText can closely mirror it.
Respond with ONLY the JSON object.`;

function buildFallback(text: string): AiSuggestion {
  return {
    outcome: `A clear plan exists for: "${text}"`,
    nextStep: "Talk together and agree the first small step.",
    suggestedDate: "within the next few days",
    suggestedOwner: "not_agreed",
    neutralShareText: `Can we take a look at this together: "${text}"?`,
    isFallback: true,
  };
}

// The org's Pulse proxy translates requests to Vertex AI under the hood and
// expects the anthropic-version header to match the body's internal
// vertex-xxxx version rather than a standard Anthropic API date version -
// otherwise every call fails with a 400 version-mismatch error. The
// ANTHROPIC_MODEL env var (e.g. "opusplan") is a Claude-Code-specific model
// alias, not a real Messages API model name, so it is intentionally not
// used here.
const MODEL = "claude-sonnet-latest";
const VERTEX_ANTHROPIC_VERSION = "vertex-2023-10-16";

export async function structureEntry(text: string): Promise<AiSuggestion> {
  const baseURL = process.env.ANTHROPIC_BASE_URL;
  const authToken = process.env.ANTHROPIC_AUTH_TOKEN;

  if (!authToken) {
    console.error("AI structuring skipped: ANTHROPIC_AUTH_TOKEN is not set");
    return buildFallback(text);
  }

  const client = new Anthropic({
    apiKey: authToken,
    baseURL: baseURL || undefined,
    defaultHeaders: { "anthropic-version": VERTEX_ANTHROPIC_VERSION },
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: text }],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const block = response.content.find((c) => c.type === "text");
    if (!block || block.type !== "text") {
      return buildFallback(text);
    }

    const jsonMatch = block.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return buildFallback(text);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const validOwners = ["creator", "partner", "together", "not_agreed"];
    const suggestedOwner = validOwners.includes(parsed.suggestedOwner)
      ? parsed.suggestedOwner
      : "not_agreed";

    return {
      outcome: String(parsed.outcome || buildFallback(text).outcome),
      nextStep: String(parsed.nextStep || buildFallback(text).nextStep),
      suggestedDate: String(
        parsed.suggestedDate || buildFallback(text).suggestedDate
      ),
      suggestedOwner,
      neutralShareText: String(
        parsed.neutralShareText || buildFallback(text).neutralShareText
      ),
      isFallback: false,
    };
  } catch (err) {
    console.error("AI structuring failed, using fallback:", err);
    return buildFallback(text);
  }
}
