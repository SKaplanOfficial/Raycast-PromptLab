import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";
import { getPersistentVariable } from "./utils";

/**
 * Directive to get the value of a persistent variable. If the variable does not exist, the placeholder will be replaced with an empty string.
 */
const GetPersistentVariablePlaceholder: Placeholder = {
  name: "get",
  regex: /{{get [a-zA-Z0-9_]+}}/g,
  apply: async (str: string) => {
    const matches = str.match(/{{get ([a-zA-Z0-9_]+)}}/);
    if (matches) {
      const key = matches[1];
      return { result: (await getPersistentVariable(key)) || "" };
    }
    return { result: "" };
  },
  constant: false,
  fn: async (id: string) => (await GetPersistentVariablePlaceholder.apply(`{{get ${id}}}`)).result,
  example: "Summarize this: {{get storedText}}",
  description:
    "Replaced with the value of a persistent variable. If the variable has not been set, the placeholder will be replaced with an empty string.",
  hintRepresentation: "{{get x}}",
  fullRepresentation: "Value of Persistent Variable",
  type: PlaceholderType.StaticDirective,
  categories: [PlaceholderCategory.Memory],
};

export default GetPersistentVariablePlaceholder;
