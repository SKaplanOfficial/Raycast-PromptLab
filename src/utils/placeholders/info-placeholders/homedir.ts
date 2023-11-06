import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";
import os from "os";

/**
 * Placeholder for the home directory of the currently logged-in user. Barring any issues, this should always be replaced.
 */
const HomeDirPlaceholder: Placeholder = {
  name: "homedir",
  regex: /{{(homedir|homeDirectory)}}/g,
  apply: async () => {
    const dir = os.homedir();
    return { result: dir, homedir: dir };
  },
  result_keys: ["homedir"],
  constant: true,
  fn: async () => (await HomeDirPlaceholder.apply("{{homedir}}")).result,
  example: '{{as:tell application "Finder" to reveal POSIX file "{{homedir}}"}}',
  description: "Replaced with the path of the home directory for the currently logged-in user.",
  hintRepresentation: "{{homedir}}",
  fullRepresentation: "Home Directory Path",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Device],
};

export default HomeDirPlaceholder;
