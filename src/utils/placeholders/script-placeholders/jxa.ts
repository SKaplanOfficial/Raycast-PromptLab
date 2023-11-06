import { execSync } from "child_process";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
   * Placeholder for output of a JavaScript for Automation script. If the script fails, this placeholder will be replaced with an empty string. No sanitization is done in the script input; the expectation is that users will only use this placeholder with trusted scripts.
   */
const JXAPlaceholder: Placeholder = {
  name: "jxa",
  regex: /{{(jxa|JXA):(([^{]|{(?!{)|{{[\\s\\S]*?}})*?)}}/g,
  apply: async (str: string) => {
    try {
      const script = str.match(/(?<=(jxa|JXA):)(([^{]|{(?!{)|{{[\s\S]*?}})*?)}}/)?.[2];
      if (!script) return { result: "", jxa: "" };
      const res = execSync(
        `osascript -l JavaScript -e "${script
          .replaceAll('"', '\\"')
          .replaceAll("`", "\\`")
          .replaceAll("$", "\\$")
          .replaceAll(new RegExp(/[\n\r]/, "g"), " \\\n")}"`
      ).toString();
      return { result: res, jxa: res };
    } catch (e) {
      return { result: "", jxa: "" };
    }
  },
  constant: false,
  fn: async (script: string) =>
    (await JXAPlaceholder.apply(`{{jxa:${script}}}`))
      .result,
  example: "{{jxa:Application('Music').currentTrack.name()}}",
  description:
    "Placeholder for output of a JavaScript for Automation script. If the script fails, this placeholder will be replaced with an empty string.",
  hintRepresentation: "{{jxa:...}}",
  fullRepresentation: "Run JXA Script",
  type: PlaceholderType.Script,
  categories: [PlaceholderCategory.Custom],
}

export default JXAPlaceholder;