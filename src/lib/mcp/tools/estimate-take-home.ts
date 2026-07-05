import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Rough UK 2024/25 estimate — for guidance only, not advice.
const PERSONAL_ALLOWANCE = 12570;
const BASIC_RATE_LIMIT = 50270;
const HIGHER_RATE_LIMIT = 125140;
const NI_PRIMARY_THRESHOLD = 12570;
const NI_UPPER_LIMIT = 50270;

export default defineTool({
  name: "estimate_uk_take_home",
  title: "Estimate UK take-home pay",
  description:
    "Rough estimate of annual UK take-home pay for an employee (England) given gross annual salary. Applies standard Personal Allowance, PAYE bands, and Class 1 NI (employee) at 8%/2%. Guidance only — not tax advice.",
  inputSchema: {
    grossAnnual: z
      .number()
      .positive()
      .describe("Gross annual salary in GBP (before tax and NI)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ grossAnnual }) => {
    const taxable = Math.max(0, grossAnnual - PERSONAL_ALLOWANCE);
    const basic = Math.min(taxable, BASIC_RATE_LIMIT - PERSONAL_ALLOWANCE);
    const higher = Math.min(
      Math.max(0, taxable - (BASIC_RATE_LIMIT - PERSONAL_ALLOWANCE)),
      HIGHER_RATE_LIMIT - BASIC_RATE_LIMIT,
    );
    const additional = Math.max(0, taxable - (HIGHER_RATE_LIMIT - PERSONAL_ALLOWANCE));
    const incomeTax = basic * 0.2 + higher * 0.4 + additional * 0.45;

    const niBand1 = Math.min(
      Math.max(0, grossAnnual - NI_PRIMARY_THRESHOLD),
      NI_UPPER_LIMIT - NI_PRIMARY_THRESHOLD,
    );
    const niBand2 = Math.max(0, grossAnnual - NI_UPPER_LIMIT);
    const nationalInsurance = niBand1 * 0.08 + niBand2 * 0.02;

    const takeHomeAnnual = grossAnnual - incomeTax - nationalInsurance;
    const fmt = (n: number) => `£${n.toFixed(2)}`;

    return {
      content: [
        {
          type: "text",
          text: [
            `Gross annual: ${fmt(grossAnnual)}`,
            `Estimated Income Tax: ${fmt(incomeTax)}`,
            `Estimated NI (Class 1): ${fmt(nationalInsurance)}`,
            `Estimated take-home annual: ${fmt(takeHomeAnnual)}`,
            `Estimated take-home monthly: ${fmt(takeHomeAnnual / 12)}`,
            "",
            "Rough guidance only — England, standard tax code, no pension or student loan. Not tax or financial advice.",
          ].join("\n"),
        },
      ],
      structuredContent: {
        grossAnnual,
        incomeTax,
        nationalInsurance,
        takeHomeAnnual,
        takeHomeMonthly: takeHomeAnnual / 12,
      },
    };
  },
});
