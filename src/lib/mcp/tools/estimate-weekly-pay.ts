import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "estimate_weekly_pay",
  title: "Estimate weekly hourly pay",
  description:
    "Estimate gross weekly pay for an hourly worker from hours worked and hourly rate. Optionally includes overtime hours paid at a multiplier.",
  inputSchema: {
    hours: z.number().nonnegative().describe("Regular hours worked this week."),
    hourlyRate: z.number().positive().describe("Hourly rate in GBP."),
    overtimeHours: z.number().nonnegative().optional().describe("Overtime hours worked (optional)."),
    overtimeMultiplier: z
      .number()
      .positive()
      .optional()
      .describe("Overtime pay multiplier, e.g. 1.5. Defaults to 1.5."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ hours, hourlyRate, overtimeHours = 0, overtimeMultiplier = 1.5 }) => {
    const regular = hours * hourlyRate;
    const overtime = overtimeHours * hourlyRate * overtimeMultiplier;
    const gross = regular + overtime;
    return {
      content: [
        {
          type: "text",
          text: `Estimated gross weekly pay: £${gross.toFixed(2)} (regular £${regular.toFixed(2)}${overtimeHours ? ` + overtime £${overtime.toFixed(2)}` : ""}).`,
        },
      ],
      structuredContent: { regular, overtime, gross },
    };
  },
});
