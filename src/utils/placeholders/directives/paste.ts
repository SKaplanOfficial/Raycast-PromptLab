import { Clipboard, showHUD } from "@raycast/api";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Directive to paste the provided text in the frontmost application. The placeholder will always be replaced with an empty string.
 */
const PasteDirective: Placeholder = {
  name: "paste",
  regex: /{{(paste):[\s\S]*?}}/g,
  apply: async (str: string) => {
    const text = str.match(/(?<=(paste:))[\s\S]*?(?=}})/)?.[0];
    if (!text) return { result: "" };
    await Clipboard.paste(text);
    await showHUD("Pasted Into Frontmost App");
    return { result: "" };
  },
  constant: false,
  fn: async (text: string) => (await PasteDirective.apply(`{{paste:${text}}}`)).result,
  example: "{{paste:Hello World}}",
  description:
    "Directive to paste the provided text in the frontmost application. The placeholder will always be replaced with an empty string.",
  hintRepresentation: "{{paste:...}}",
  fullRepresentation: "Paste From Clipboard",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Device, PlaceholderCategory.Applications],
};

export default PasteDirective;
