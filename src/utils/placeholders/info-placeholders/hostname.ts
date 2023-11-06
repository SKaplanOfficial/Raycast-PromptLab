import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";
import os from "os";

/**
 * Placeholder for the hostname of the current machine. Barring any issues, this should always be replaced.
 */
const HostnamePlaceholder: Placeholder = {
  name: "hostname",
  regex: /{{hostname}}/g,
  apply: async () => {
    const name = os.hostname();
    return { result: name, hostname: name };
  },
  result_keys: ["hostname"],
  constant: true,
  fn: async () => (await HostnamePlaceholder.apply("{{hostname}}")).result,
  example: "Come up with aliases for {{hostname}}",
  description: "Replaced with the hostname of the current machine.",
  hintRepresentation: "{{hostname}}",
  fullRepresentation: "Device Hostname",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Device],
};

export default HostnamePlaceholder;
