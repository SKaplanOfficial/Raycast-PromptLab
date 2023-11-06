import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";
import { resetPersistentVariable, setPersistentVariable } from "./utils";

/**
 * Directive to reset the value of a persistent variable to its initial value. If the variable does not exist, nothing will happen. The placeholder will always be replaced with an empty string.
 */
const ResetPersistentVariablePlaceholder: Placeholder = {
  name: "reset",
  regex: /{{reset [a-zA-Z0-9_]+}}/g,
  apply: async (str: string) => {
    const matches = str.match(/{{reset ([a-zA-Z0-9_]+)}}/);
    if (matches) {
      const key = matches[1];
      const initialValue = await resetPersistentVariable(key);
      await setPersistentVariable(key, initialValue);
    }
    return { result: "" };
  },
  constant: false,
  fn: async (id: string) => (await ResetPersistentVariablePlaceholder.apply(`{{reset ${id}}}`)).result,
  example: "{{reset storedText}}",
  description:
    "Resets the value of a persistent variable to its initial value. If the variable does not exist, nothing will happen. Replaced with an empty string.",
  hintRepresentation: "{{reset x}}",
  fullRepresentation: "Reset Persistent Variable",
  type: PlaceholderType.StaticDirective,
  categories: [PlaceholderCategory.Memory],
};

export default ResetPersistentVariablePlaceholder;
