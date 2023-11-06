import { getFrontmostApplication } from "@raycast/api";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the name of the current application. Barring any issues, this should always be replaced.
 */
const CurrentAppNamePlaceholder: Placeholder = {
  name: "currentAppName",
  regex: /{{(currentAppName|currentApp|currentApplication|currentApplicationName)}}/g,
  apply: async () => {
    try {
      const app = (await getFrontmostApplication()).name || "";
      return { result: app, currentAppName: app };
    } catch (e) {
      return { result: "", currentAppName: "" };
    }
  },
  result_keys: ["currentAppName"],
  constant: true,
  fn: async () => (await CurrentAppNamePlaceholder.apply("{{currentAppName}}")).result,
  example: "Tell me about {{currentAppName}}",
  description: "Replaced with the name of the current application.",
  hintRepresentation: "{{currentAppName}}",
  fullRepresentation: "Current Application Name",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Files, PlaceholderCategory.Applications],
};

export default CurrentAppNamePlaceholder;
