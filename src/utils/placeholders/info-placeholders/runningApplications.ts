import { filterString } from "../../context-utils";
import { getRunningApplications } from "../../scripts";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for a comma-separated list of the names of all running applications that are visible to the user.
 */
const RunningApplicationsPlaceholder: Placeholder = {
  name: "runningApplications",
  regex: /{{runningApplications}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "runningApplications" in context) {
      return {
        result: context["runningApplications"] as string,
        runningApplications: context["runningApplications"] as string,
      };
    }

    const apps = filterString(await getRunningApplications());
    return { result: apps, runningApplications: apps };
  },
  result_keys: ["runningApplications"],
  constant: true,
  fn: async () => (await RunningApplicationsPlaceholder.apply("{{runningApplications}}")).result,
  example: "Come up for a name for a workspace running the following apps: {{runningApplications}}",
  description:
    "Replaced with the comma-separated list of names of all running applications that are visible to the user.",
  hintRepresentation: "{{runningApplications}}",
  fullRepresentation: "Running Applications",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Applications],
};

export default RunningApplicationsPlaceholder;
