import { runAppleScript } from "@raycast/utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the current working directory. If the current application is not Finder, this placeholder will not be replaced.
 */
const CurrentDirectoryPlaceholder: Placeholder = {
  name: "currentDirectory",
  regex: /{{currentDirectory}}/g,
  apply: async () => {
    const dir = await runAppleScript(`tell application "Finder" to return POSIX path of (insertion location as alias)`);
    return { result: dir, currentDirectory: dir };
  },
  result_keys: ["currentDirectory"],
  constant: true,
  fn: async () => (await CurrentDirectoryPlaceholder.apply("{{currentDirectory}}")).result,
  example: "Tell me about {{currentDirectory}}",
  description: "Replaced with the path of the current working directory in Finder.",
  hintRepresentation: "{{currentDirectory}}",
  fullRepresentation: "Current Directory Path",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Files, PlaceholderCategory.Applications],
};

export default CurrentDirectoryPlaceholder;
