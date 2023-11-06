import { Clipboard } from "@raycast/api";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the text currently stored in the clipboard. If the clipboard is empty, this will be replaced with an empty string. Most clipboard content supplies a string format, such as file names when copying files in Finder.
 */
const ClipboardTextPlaceholder: Placeholder = {
  name: "clipboardText",
  regex: /{{(clipboardText|clipboard)}}/g,
  apply: async (_, context?: { [key: string]: unknown }) => {
    if (context?.["clipboardText"]?.toString().length) {
      return { result: context["clipboardText"] as string, clipboardText: context["clipboardText"] };
    }

    try {
      const text = (await Clipboard.readText()) || "";
      return { result: text, clipboardText: text };
    } catch (e) {
      return { result: "", clipboardText: "" };
    }
  },
  result_keys: ["clipboardText"],
  constant: true,
  fn: async () => (await ClipboardTextPlaceholder.apply("{{clipboardText}}")).result,
  example: "Summarize this: {{clipboardText}}",
  description:
    "Replaced with the text currently stored in the clipboard. If the clipboard is empty, this will be replaced with an empty string. Most clipboard content supplies a string format, such as file names when copying files in Finder.",
  hintRepresentation: "{{clipboardText}}",
  fullRepresentation: "Clipboard Text",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Device],
};

export default ClipboardTextPlaceholder;
