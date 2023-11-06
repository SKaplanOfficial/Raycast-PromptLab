import { STORAGE_KEYS } from "../../constants";
import { getStorage } from "../../storage-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for a list of all previously used UUIDs since PromptLab's LocalStorage was last reset.
 */
const UsedUUIDsPlaceholder: Placeholder = {
  name: "usedUUIDs",
  regex: /{{usedUUIDs}}/g,
  apply: async () => {
    const usedUUIDs = await getStorage(STORAGE_KEYS.USED_UUIDS);
    if (Array.isArray(usedUUIDs)) {
      return { result: usedUUIDs.join(", "), usedUUIDs: usedUUIDs.join(", ") };
    }
    return { result: "", usedUUIDs: "" };
  },
  result_keys: ["usedUUIDs"],
  constant: false,
  fn: async () => (await UsedUUIDsPlaceholder.apply("{{usedUUIDs}}")).result,
  example: "{{copy:{{usedUUIDs}}}}",
  description:
    "Replaced with a comma-separated list of all previously used UUIDs since PromptLab's LocalStorage was last reset.",
  hintRepresentation: "{{usedUUIDs}}",
  fullRepresentation: "List of Used UUIDs",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Memory],
};

export default UsedUUIDsPlaceholder;
