import { ScriptRunner } from "../../scripts";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";
import * as fs from "fs";

/**
 * Placeholder for metadata of the currently selected files in Finder as a comma-separated list.
 */
const FileMetadataPlaceholder: Placeholder = {
  name: "metadata",
  regex: /{{metadata}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    const files = (
      context && "selectedFiles" in context
        ? (context["selectedFiles"] as string)
        : (await ScriptRunner.SelectedFiles()).csv
    ).split(", ");
    const metadata =
      context && "metadata" in context
        ? (context["metadata"] as string)
        : files
            .map((file) => {
              const fileMetadata = Object.entries(fs.lstatSync(file))
                .map(([key, value]) => `${key}:${value}`)
                .join("\n");
              return `${file}:\n${fileMetadata}`;
            })
            .join("\n\n");
    return { result: metadata, metadata: metadata, selectedFiles: files.join(", ") };
  },
  result_keys: ["metadata", "selectedFiles"],
  constant: true,
  fn: async () => (await FileMetadataPlaceholder.apply("{{metadata}}")).result,
  example: "Which of these has the largest filesize? {{metadata}}",
  description:
    "Replaced with metadata of the currently selected files in Finder as a comma-separated list. If no files are selected, this will be replaced with an empty string.",
  hintRepresentation: "{{metadata}}",
  fullRepresentation: "Selected File Metadata",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Files],
};

export default FileMetadataPlaceholder;
