import { filterString, getLastEmail } from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the text of the most recently received email in Mail.app.
 */
const LastEmailPlaceholder: Placeholder = {
  name: "lastEmail",
  regex: /{{lastEmail}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "lastEmail" in context) {
      return { result: context["lastEmail"] as string, lastEmail: context["lastEmail"] as string };
    }

    const email = filterString(await getLastEmail());
    return { result: email, lastEmail: email };
  },
  result_keys: ["lastEmail"],
  constant: true,
  fn: async () => (await LastEmailPlaceholder.apply("{{lastEmail}}")).result,
  example: "Summarize this: {{lastEmail}}",
  description: "Replaced with the text of the most recently received email in Mail.app.",
  hintRepresentation: "{{lastEmail}}",
  fullRepresentation: "Text of Last Email",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Applications],
};

export default LastEmailPlaceholder;
