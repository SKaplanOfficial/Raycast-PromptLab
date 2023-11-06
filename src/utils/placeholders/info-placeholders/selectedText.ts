import { getSelectedText } from "@raycast/api";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the currently selected text. If no text is selected, this will be replaced with an empty string.
 */
const SelectedTextPlaceholder: Placeholder = {
  name: "selectedText",
  regex: /{{selectedText}}/g,
  apply: async () => {
    try {
      const text = await getSelectedText();
      return { result: text, selectedText: text };
    } catch (e) {
      return { result: "", selectedText: "" };
    }
  },
  result_keys: ["selectedText"],
  constant: true,
  fn: async () => (await SelectedTextPlaceholder.apply("{{selectedText}}")).result,
  example: "Rewrite this as a list: {{selectedText}}",
  description:
    "Replaced with the currently selected text. If no text is selected, this will be replaced with an empty string.",
  hintRepresentation: "{{selectedText}}",
  fullRepresentation: "Selected Text",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Device],
};

export default SelectedTextPlaceholder;
