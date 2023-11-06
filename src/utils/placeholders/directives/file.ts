import { filterString } from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";
import * as os from "os";
import * as fs from "fs";

/**
 * Placeholder for the raw text of a file at the given path. The path can be absolute or relative to the user's home directory (e.g. `~/Desktop/file.txt`). The file must be readable as UTF-8 text, or the placeholder will be replaced with an empty string.
 */
const FilePlaceholder: Placeholder = {
  name: "file",
  regex: /{{file:(.|^[\s\n\r])*?}}/g,
  apply: async (str: string) => {
    const target = str.match(/(?<=(file:))[\s\S]*?(?=}})/)?.[0];
    if (!target) return { result: "", file: "" };

    const filePath = target.startsWith("~") ? target.replace("~", os.homedir()) : target;
    if (filePath == "") return { result: "", file: "" };

    if (!filePath.startsWith("/")) return { result: "", file: "" };

    try {
      const text = fs.readFileSync(filePath, "utf-8");
      return { result: filterString(text), file: filterString(text) };
    } catch (e) {
      return { result: "", file: "" };
    }
  },
  constant: false,
  fn: async (path: string) => (await FilePlaceholder.apply(`{{file:${path}}}`)).result,
  example: "{{file:/Users/username/Desktop/file.txt}}",
  description: "Placeholder for the raw text of a file at the given path.",
  hintRepresentation: "{{file:...}}",
  fullRepresentation: "Text of File At Path",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Files],
};

export default FilePlaceholder;
