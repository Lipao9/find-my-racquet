import type Anthropic from "@anthropic-ai/sdk";
import type { Answers } from "./answers";
import type { Racket } from "./catalog";

export const RECOMMEND_MODEL = "claude-haiku-4-5-20251001";

// Static schema (no per-request candidate enum) so the compiled strict
// schema stays cacheable server-side. IDs are validated in recommend.ts.
export const recommendTool: Anthropic.Tool = {
  name: "recommend_rackets",
  description:
    "Return the 3 best racquets for this player, ordered best-first.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      recommendations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            racket_id: {
              type: "string",
              description: "An id copied exactly from the candidate list.",
            },
            justification: {
              type: "string",
              description:
                "2-3 sentences in the requested language, referencing the player's answers and the racquet's concrete specs.",
            },
          },
          required: ["racket_id", "justification"],
          additionalProperties: false,
        },
      },
    },
    required: ["recommendations"],
    additionalProperties: false,
  },
};

const LANGUAGE_NAMES: Record<string, string> = {
  "pt-BR": "Brazilian Portuguese",
  en: "English",
};

export function buildSystemPrompt(locale: "pt-BR" | "en"): string {
  return [
    "You are an expert tennis racquet advisor.",
    "From the numbered candidate list in the user message, pick exactly 3 racquets best suited to the player profile, ordered best-first.",
    `Justify each pick in 2-3 sentences written in ${LANGUAGE_NAMES[locale]}, referencing the player's specific answers (skill, style, arm health) and the racquet's concrete specs.`,
    "When the profile includes free-text answers in the player's own words, weigh them heavily and echo their concerns in the justifications.",
    "Only use racket_id values copied exactly from the candidate list. Never repeat a racquet.",
  ].join(" ");
}

const ANSWER_LABELS: Record<keyof Answers | string, string> = {
  skill: "Skill level",
  frequency: "Playing frequency",
  style: "Playing style",
  powerControl: "Power vs control priority",
  armInjury: "Arm/elbow/shoulder injury history",
  weightPref: "Weight preference",
  headSizePref: "Head size preference",
  gripSize: "Grip size",
  stringPattern: "String pattern preference",
  currentRacquet: "Current racquet",
  courtType: "Most played surface",
  swingSpeed: "Swing speed",
  spinStyle: "Spin style",
  racquetFeel: "Likes/dislikes about current racquet (player's own words)",
  strengths: "Game strengths (player's own words)",
  improveGoals: "What they want to improve (player's own words)",
  physicalProfile: "Physical profile (player's own words)",
  anythingElse: "Additional notes (player's own words)",
};

function racketLine(r: Racket, index: number): string {
  const parts = [
    `${index + 1}. ${r.id}`,
    `${r.brand} ${r.model}`,
    `${r.headSizeIn2} in²`,
    `${r.weightGrams}g strung`,
    r.stiffnessRA !== null ? `RA ${r.stiffnessRA}` : "RA n/a",
    r.stringPattern,
    r.swingweight !== null ? `SW ${r.swingweight}` : "SW n/a",
    `balance ${r.balance}`,
  ];
  return parts.join(" | ");
}

export function buildUserMessage(
  candidates: Racket[],
  answers: Answers,
): string {
  const profile = Object.entries(answers)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `- ${ANSWER_LABELS[k] ?? k}: ${v}`)
    .join("\n");

  const list = candidates.map(racketLine).join("\n");

  return `Player profile:\n${profile}\n\nCandidate racquets (id | name | head size | weight | stiffness | pattern | swingweight | balance):\n${list}`;
}
