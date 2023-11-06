import { filterString } from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the comma-separated list of titles and URLs of all bookmarks in Safari, obtained via plist.
 */
const SafariBookmarksPlaceholder: Placeholder = {
  name: "safariBookmarks",
  regex: /{{safariBookmarks}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "safariBookmarks" in context) {
      return { result: context["safariBookmarks"] as string, safariBookmarks: context["safariBookmarks"] as string };
    }

    const sites = filterString("");
    return { result: sites, safariBookmarks: sites };
  },
  result_keys: ["safariBookmarks"],
  constant: true,
  fn: async () => (await SafariBookmarksPlaceholder.apply("{{safariBookmarks}}")).result,
  example: "Based on this list of websites, suggest some new ones I might like: {{safariBookmarks}}",
  description: "Replaced with the comma-separated list of titles and URLs of bookmarks in Safari.",
  hintRepresentation: "{{safariBookmarks}}",
  fullRepresentation: "Safari Bookmarks",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Applications],
};

export default SafariBookmarksPlaceholder;
