import { addFileToSelection } from "../../scripts";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Directive to select files. The placeholder will always be replaced with an empty string.
 */
const SelectFileDirective: Placeholder = {
  name: "selectFile",
  regex: /{{(selectFile)(:[\s\S]*?)?}}/g,
  apply: async (str: string) => {
    const file = str.match(/(?<=(selectFiles:))[\s\S]*?(?=}})/)?.[0];
    if (!file) return { result: "" };
    await addFileToSelection(file);
    return { result: "" };
  },
  constant: false,
  fn: async (path: string) => (await SelectFileDirective.apply(`{{selectFile:${path}}}`)).result,
  example: "{{selectFile:/Users/username/Desktop/file.txt}}",
  description: "Directive to a select file. The placeholder will always be replaced with an empty string.",
  hintRepresentation: "{{selectFile:...}}",
  fullRepresentation: "Select File At Path",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Files, PlaceholderCategory.Applications],
};

export default SelectFileDirective;
