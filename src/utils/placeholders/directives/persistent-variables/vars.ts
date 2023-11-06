import { STORAGE_KEYS } from "../../../constants";
import { getStorage } from "../../../storage-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";
import { PersistentVariable } from "./types";

const VarsPlaceholder: Placeholder = {
  name: "vars",
  regex: /{{vars}}/g,
  apply: async () => {
    const vars: PersistentVariable[] = await getStorage(STORAGE_KEYS.PERSISTENT_VARIABLES);
    if (Array.isArray(vars)) {
      const varNames = vars.map((v) => v.name);
      return { result: varNames.join(", "), vars: varNames.join(", ") };
    }
    return { result: "", vars: "" };
  },
  result_keys: ["vars"],
  constant: true,
  fn: async () => (await VarsPlaceholder.apply("{{vars}}")).result,
  example: "List these alphabetically: {{vars}}",
  description:
    "Replaced with a comma-separated list of all persistent variables. If no persistent variables have been set, the placeholder will be replaced with an empty string.",
  hintRepresentation: "{{vars}}",
  fullRepresentation: "List of Persistent Variables",
  type: PlaceholderType.StaticDirective,
  categories: [PlaceholderCategory.Memory],
};

export default VarsPlaceholder;
