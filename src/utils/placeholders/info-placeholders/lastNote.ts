import { filterString, getLastNote } from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the HTML text of the most recently edited note in Notes.app.
 */
const LastNotePlaceholder: Placeholder = {
  name: "lastNote",
  regex: /{{lastNote}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "lastNote" in context) {
      return { result: context["lastNote"] as string, lastNote: context["lastNote"] as string };
    }

    const note = filterString(await getLastNote());
    return { result: note, lastNote: note };
  },
  result_keys: ["lastNote"],
  constant: true,
  fn: async () => (await LastNotePlaceholder.apply("{{lastNote}}")).result,
  example: "Summarize this: {{lastNote}}",
  description: "Replaced with the HTML text of the most recently edited note in Notes.app.",
  hintRepresentation: "{{lastNote}}",
  fullRepresentation: "Text of Last Note",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Applications],
};

export default LastNotePlaceholder;
