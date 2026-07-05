import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_app_info",
  title: "Get PayFlow info",
  description:
    "Returns a short description of PayFlow — a UK pay transparency app for hourly workers — including who it's for, what it does, and pricing model.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: [
          "PayFlow is a UK pay transparency app by Londonra Ltd (London).",
          "For workers: free — tracks hours, breaks down payslips in plain English, flags tax code errors, and helps set savings goals.",
          "For employers: from £2/worker/month — compliance early-warning dashboard, payroll query analytics, worker satisfaction tracking, API integration.",
          "Free for workers. Employers pay for the dashboard.",
        ].join("\n"),
      },
    ],
  }),
});
