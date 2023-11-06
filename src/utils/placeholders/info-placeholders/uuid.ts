import { STORAGE_KEYS } from "../../constants";
import { getStorage, setStorage } from "../../storage-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

import crypto from "crypto";

/**
 * Placeholder for a unique UUID. UUIDs are tracked in the {@link StorageKey.USED_UUIDS} storage key. The UUID will be unique for each use of the placeholder (but there is no guarantee that it will be unique across different instances of the extension, e.g. on different computers).
 */
const UUIDPlaceholder: Placeholder = {
  name: "uuid",
  regex: /{{(uuid|UUID)}}/g,
  apply: async () => {
    let newUUID = crypto.randomUUID();
    const usedUUIDs = await getStorage(STORAGE_KEYS.USED_UUIDS);
    if (Array.isArray(usedUUIDs)) {
      while (usedUUIDs.includes(newUUID)) {
        newUUID = crypto.randomUUID();
      }
      usedUUIDs.push(newUUID);
      await setStorage(STORAGE_KEYS.USED_UUIDS, usedUUIDs);
    } else {
      await setStorage(STORAGE_KEYS.USED_UUIDS, [newUUID]);
    }
    return { result: newUUID, uuid: newUUID };
  },
  result_keys: ["uuid" + crypto.randomUUID()],
  constant: false,
  fn: async () => (await UUIDPlaceholder.apply("{{uuid}}")).result,
  example: "{{copy:{{uuid}}}}",
  description: "Replaced with a unique UUID. UUIDs are tracked in the {{usedUUIDs}} placeholder.",
  hintRepresentation: "{{uuid}}",
  fullRepresentation: "New UUID",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Memory],
};

export default UUIDPlaceholder;
