import { getFrontmostApplication } from "@raycast/api";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the bundle ID of the current application.
 */
const CurrentAppBundleIDPlaceholder: Placeholder = {
  name: "currentAppBundleID",
  regex: /{{(currentAppBundleID|currentApplicationBundleID)}}/g,
  apply: async () => {
    try {
      const id = (await getFrontmostApplication()).bundleId || "";
      return { result: id, currentAppBundleID: id };
    } catch (e) {
      return { result: "", currentAppBundleID: "" };
    }
  },
  result_keys: ["currentAppBundleID"],
  constant: true,
  fn: async () => (await CurrentAppBundleIDPlaceholder.apply("{{currentAppBundleID}}")).result,
  example: "Tell me about {{currentAppBundleID}}",
  description: "Replaced with the bundle ID of the current application.",
  hintRepresentation: "{{currentAppBundleID}}",
  fullRepresentation: "Current Application Bundle ID",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Files, PlaceholderCategory.Applications],
};

export default CurrentAppBundleIDPlaceholder;
