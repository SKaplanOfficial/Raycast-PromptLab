import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";
import { deletePersistentVariable } from "./utils";

/**
 * Directive to delete a persistent variable. If the variable does not exist, nothing will happen. The placeholder will always be replaced with an empty string.
 */
const DeletePersistentVariablePlaceholder: Placeholder = {
  name: "delete",
  regex: /{{delete [a-zA-Z0-9_]+}}/g,
  apply: async (str: string) => {
    const matches = str.match(/{{delete ([a-zA-Z0-9_]+)}}/);
    if (matches) {
      const key = matches[1];
      await deletePersistentVariable(key);
    }
    return { result: "" };
  },
  constant: false,
  fn: async (id: string) => (await DeletePersistentVariablePlaceholder.apply(`{{delete ${id}}}`)).result,
  example: "{{delete storedText}}",
  description:
    "Deletes a persistent variable. If the variable does not exist, nothing will happen. Replaced with an empty string.",
  hintRepresentation: "{{delete x}",
  fullRepresentation: "Delete Persistent Variable",
  type: PlaceholderType.StaticDirective,
  categories: [PlaceholderCategory.Memory],
};

export default DeletePersistentVariablePlaceholder;
