import { filterString } from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the comma-separated list of titles and URLs of the most frequently visited websites in Safari, obtained via plist.
 */
const SafariTopSitesPlaceholder: Placeholder = {
  name: "safariTopSites",
  regex: /{{safariTopSites}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "safariTopSites" in context) {
      return { result: context["safariTopSites"] as string, safariTopSites: context["safariTopSites"] as string };
    }

    const sites = filterString("");
    return { result: sites, safariTopSites: sites };
  },
  result_keys: ["safariTopSites"],
  constant: true,
  fn: async () => (await SafariTopSitesPlaceholder.apply("{{safariTopSites}}")).result,
  example: "Based on this list of websites, suggest some new ones I might like: {{safariTopSites}}",
  description:
    "Replaced with the comma-separated list of titles and URLs of the most frequently visited websites in Safari.",
  hintRepresentation: "{{safariTopSites}}",
  fullRepresentation: "Safari Top Sites",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Applications],
};

export default SafariTopSitesPlaceholder;
