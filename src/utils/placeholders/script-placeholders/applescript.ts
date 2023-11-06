import { runAppleScript } from "@raycast/utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
   * Placeholder for output of an AppleScript script. If the script fails, this placeholder will be replaced with an empty string. No sanitization is done in the script input; the expectation is that users will only use this placeholder with trusted scripts.
   */
const AppleScriptPlaceholder: Placeholder = {
  name: "as",
  regex: /{{(as|AS):(([^{]|{(?!{)|{{[\\s\\S]*?}})*?)}}/g,
  apply: async (str: string) => {
    try {
      const script = str.match(/(as|AS):(([^{]|{(?!{)|{{[\s\S]*?}})*?)}}/)?.[2];
      if (!script) return { result: "", applescript: "" };

      const res = await runAppleScript(script);
      return { result: res, applescript: res };
    } catch (e) {
      return { result: "", applescript: "" };
    }
  },
  constant: false,
  fn: async (script: string) =>
    (await AppleScriptPlaceholder.apply(`{{as:${script}}}`))
      .result,
  example: '{{as:display dialog "Hello World"}}',
  description:
    "Placeholder for output of an AppleScript script. If the script fails, this placeholder will be replaced with an empty string.",
  hintRepresentation: "{{as:...}}",
  fullRepresentation: "Run AppleScript",
  type: PlaceholderType.Script,
  categories: [PlaceholderCategory.Custom],
}

export default AppleScriptPlaceholder;