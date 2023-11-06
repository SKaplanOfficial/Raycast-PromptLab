import { ScriptRunner } from "../../scripts";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Place holder for the names of the currently selected files in Finder as a comma-separated list.
 */
const FileNamesPlaceholder: Placeholder = {
  name: "fileNames",
  regex: /{{fileNames}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    const files =
      context && "selectedFiles" in context
        ? (context["selectedFiles"] as string)
        : (await ScriptRunner.SelectedFiles()).csv;
    if (files.length == 0) return { result: "", fileNames: "", selectedFiles: "" };
    const fileNames = files
      .split(", ")
      .map((file) => file.split("/").pop())
      .join(", ");
    return { result: fileNames, fileNames: fileNames, selectedFiles: files };
  },
  result_keys: ["fileNames", "selectedFiles"],
  constant: true,
  fn: async () => (await FileNamesPlaceholder.apply("{{fileNames}}")).result,
  example: "Sort this list of files by name: {{fileNames}}",
  description:
    "Replaced with the names of the currently selected files in Finder as a comma-separated list. If no files are selected, this will be replaced with an empty string.",
  hintRepresentation: "{{fileNames}}",
  fullRepresentation: "Selected File Names",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Files],
};

export default FileNamesPlaceholder;
