import { runAppleScript } from "@raycast/utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";
import { showHUD } from "@raycast/api";

/**
 * Directive to type the provided text in the frontmost application. The placeholder will always be replaced with an empty string.
 */
const TypeDirective: Placeholder = {
  name: "type",
  regex: /{{type:(([^{]|{(?!{)|{{[\s\S]*?}})*?)}}/g,
  apply: async (str: string) => {
    const text = str.match(/(?<=(type:))(([^{]|{(?!{)|{{[\s\S]*?}})*?)(?=}})/)?.[0];
    if (!text) return { result: "" };
    await showHUD("Typing Into Frontmost App");
    await runAppleScript(`tell application "System Events" to keystroke "${text}"`);
    return { result: "" };
  },
  constant: false,
  fn: async (text: string) => (await TypeDirective.apply(`{{type:${text}}}`)).result,
  example: "{{type:Hello World}}",
  description:
    "Directive to type the provided text in the frontmost application. The placeholder will always be replaced with an empty string.",
  hintRepresentation: "{{type:...}}",
  fullRepresentation: "Type Text",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Device, PlaceholderCategory.Applications],
};

export default TypeDirective;
