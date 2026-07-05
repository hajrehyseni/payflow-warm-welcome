import { defineMcp } from "@lovable.dev/mcp-js";
import getAppInfo from "./tools/get-app-info";
import estimateTakeHome from "./tools/estimate-take-home";
import estimateWeeklyPay from "./tools/estimate-weekly-pay";

export default defineMcp({
  name: "payflow-mcp",
  title: "PayFlow",
  version: "0.1.0",
  instructions:
    "PayFlow tools for UK pay transparency. Use `get_app_info` to describe the app, `estimate_weekly_pay` for hourly pay math, and `estimate_uk_take_home` for a rough UK take-home estimate. All results are general guidance, not financial or tax advice.",
  tools: [getAppInfo, estimateTakeHome, estimateWeeklyPay],
});
