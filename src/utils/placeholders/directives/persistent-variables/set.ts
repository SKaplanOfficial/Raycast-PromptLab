import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";
import { setPersistentVariable } from "./utils";

/**
 * Directive to set the value of a persistent variable. If the variable does not exist, it will be created. The placeholder will always be replaced with an empty string.
 */
const SetPersistentVariablePlaceholder: Placeholder = {
  name: "setPersistentVariable",
  regex: /{{set [a-zA-Z0-9_]+:[\\s\\S]*?}}/g,
  apply: async (str: string) => {
    const matches = str.match(/{{set ([a-zA-Z0-9_]+):([\s\S]*?)}}/);
    if (matches) {
      const key = matches[1];
      const value = matches[2];
      await setPersistentVariable(key, value);
    }
    return { result: "" };
  },
  constant: false,
  fn: async (id: string, value: string) =>
    (await SetPersistentVariablePlaceholder.apply(`{{set ${id}:${value}}}`)).result,
  example: "{{set myVariable:Hello World}}",
  description:
    "Directive to set the value of a persistent variable. If the variable does not exist, it will be created. The placeholder will always be replaced with an empty string.",
  hintRepresentation: "{{set x:...}}",
  fullRepresentation: "Set Value of Persistent Variable",
  type: PlaceholderType.StaticDirective,
  categories: [PlaceholderCategory.Memory],
};

export default SetPersistentVariablePlaceholder;
