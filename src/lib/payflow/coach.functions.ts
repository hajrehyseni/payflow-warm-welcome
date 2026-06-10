import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CoachInput = z.object({
  question: z.string().min(1).max(800),
  context: z
    .object({
      weekHours: z.number().optional(),
      weekNet: z.number().optional(),
      hourlyRate: z.number().optional(),
      payCycle: z.string().optional(),
    })
    .optional(),
});

const SYSTEM = `You are "Flow Coach" inside PayFlow, a UK app that helps hourly workers understand their pay.

STRICT GUARDRAILS — non-negotiable:
- Stay strictly on PayFlow topics: understanding pay, payslips, deductions (PAYE/NI/pension at a general level), how to use the PayFlow app, saving habits, and general money education for UK hourly workers.
- You MUST NOT give personalised financial, tax, legal, payroll or investment advice. If the user asks for any of these, kindly decline in one short sentence and suggest checking with their payroll team, HMRC, MoneyHelper, Citizens Advice, or a qualified regulated adviser.
- Never recommend wage advances, salary advances, earned wage access, loans, credit products, banking products, or specific investments.
- If a question is off-topic (relationships, medical, politics, coding, etc.), gently redirect to pay/PayFlow topics.
- Use warm, plain UK English. Short sentences. No jargon. No emojis. Use £ for money.
- Keep replies under 120 words. Use 1-3 short paragraphs or a tiny bullet list.
- Always frame numbers as estimates / guidance, not fact.
- End with the disclaimer line on its own paragraph, exactly: "Flow Coach gives general information only — not financial, tax, legal or payroll advice."`;

export const askCoach = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CoachInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { answer: "Coach isn't available right now — please try again shortly.\n\nFlow Coach gives general information only — not financial, tax, legal or payroll advice." };

    const [{ generateText }, { createOpenAICompatible }] = await Promise.all([
      import("ai"),
      import("@ai-sdk/openai-compatible"),
    ]);

    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: {
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
    });

    const ctx = data.context
      ? `\n\nUser context (rough estimates from PayFlow, may be incomplete): ${JSON.stringify(data.context)}`
      : "";

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system: SYSTEM,
        prompt: `${data.question}${ctx}`,
      });
      return { answer: text };
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("429")) return { answer: "Lots of questions right now — please try again in a moment.\n\nFlow Coach gives general information only — not financial, tax, legal or payroll advice." };
      if (msg.includes("402")) return { answer: "Coach is temporarily unavailable. Please try again later.\n\nFlow Coach gives general information only — not financial, tax, legal or payroll advice." };
      return { answer: "Couldn't reach Coach just now. Please try again.\n\nFlow Coach gives general information only — not financial, tax, legal or payroll advice." };
    }
  });
