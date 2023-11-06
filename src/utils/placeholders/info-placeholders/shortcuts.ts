import { runAppleScript } from "@raycast/utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the list of names of all Siri Shortcuts on the current machine. The list is comma-separated.
 */
const ShortcutsPlaceholder: Placeholder = {
  name: "shortcuts",
  regex: /{{shortcuts}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    const shortcuts =
      context && "shortcuts" in context
        ? (context["shortcuts"] as string)
        : await runAppleScript(`tell application "Shortcuts Events" to return name of every shortcut`);
    return { result: shortcuts, shortcuts: shortcuts };
  },
  result_keys: ["shortcuts"],
  constant: true,
  fn: async () => (await ShortcutsPlaceholder.apply("{{shortcuts}}")).result,
  example: "Based on the following list, recommend some Siri Shortcuts for me to create: {{shortcuts}}",
  description: "Replaced with a comma-separated list of names of each Shortcut on the current machine.",
  hintRepresentation: "{{shortcuts}}",
  fullRepresentation: "List of Siri Shortcuts",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Applications],
};

export default ShortcutsPlaceholder;
