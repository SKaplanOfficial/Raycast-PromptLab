import { Browser } from "../../browsers";
import { getActiveBrowser } from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the visible text of the current tab in any supported browser. See {@link SupportedBrowsers} for the list of supported browsers. If the current application is not a supported browser, this placeholder will not be replaced.
 */
const CurrentTabTextPlaceholder: Placeholder = {
  name: "currentTabText",
  regex: /{{(currentTabText|tabText)}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    const data = {
      result: (context?.["currentTabText"] as string) || "",
      currentTabText: (context?.["currentTabText"] as string) || "",
      currentAppName: (context?.["currentAppName"] as string) || "",
      activeBrowser: (context?.["activeBrowser"] as Browser) || null,
    };
    if (data.result.length > 0) return data;

    try {
      const app = (data.activeBrowser || (await getActiveBrowser())) as Browser;
      const tabText = await app?.currentTabText();
      if (app && tabText) {
        data.result = tabText;
        data.currentTabText = tabText;
        data.currentAppName = app.name;
        data.activeBrowser = app;
      }
    } catch (e) {
      console.error(e);
    }
    return data;
  },
  result_keys: ["currentTabText", "currentAppName"],
  dependencies: ["currentAppName"],
  constant: true,
  fn: async () => (await CurrentTabTextPlaceholder.apply("{{currentTabText}}")).result,
  example: "Summarize this: {{currentTabText}}",
  description: "Replaced with the visible text of the current tab in any supported browser.",
  hintRepresentation: "{{currentTabText}}",
  fullRepresentation: "Text of Current Browser Tab",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Internet, PlaceholderCategory.Applications],
};

export default CurrentTabTextPlaceholder;
