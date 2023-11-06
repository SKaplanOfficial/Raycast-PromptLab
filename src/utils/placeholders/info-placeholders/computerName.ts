import { getComputerName } from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the 'pretty' hostname of the current machine. Barring any issues, this should always be replaced.
 */
const ComputerNamePlaceholder: Placeholder = {
  name: "computerName",
  regex: /{{computerName}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "computerName" in context) {
      return { result: context["computerName"] as string, computerName: context["computerName"] as string };
    }

    const name = await getComputerName();
    return { result: name, computerName: name };
  },
  result_keys: ["computerName"],
  constant: true,
  fn: async () => (await ComputerNamePlaceholder.apply("{{computerName}}")).result,
  example: "Come up with aliases for {{computerName}}",
  description: "Replaced with the 'pretty' hostname of the current machine.",
  hintRepresentation: "{{computerName}}",
  fullRepresentation: "Computer Name",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Device],
};

export default ComputerNamePlaceholder;
