import { getFrontmostApplication } from "@raycast/api";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the path of the current application. Barring any issues, this should always be replaced.
 */
const CurrentAppPathPlaceholder: Placeholder = {
  name: "currentAppPath",
  regex: /{{(currentAppPath|currentApplicationPath)}}/g,
  apply: async () => {
    try {
      const appPath = (await getFrontmostApplication()).path || "";
      return { result: appPath, currentAppPath: appPath };
    } catch (e) {
      return { result: "", currentAppPath: "" };
    }
  },
  result_keys: ["currentAppPath"],
  constant: true,
  fn: async () => (await CurrentAppPathPlaceholder.apply("{{currentAppPath}}")).result,
  example: "Tell me about {{currentAppPath}}",
  description: "Replaced with the path of the current application.",
  hintRepresentation: "{{currentAppPath}}",
  fullRepresentation: "Current Application Path",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Files, PlaceholderCategory.Applications],
};

export default CurrentAppPathPlaceholder;
