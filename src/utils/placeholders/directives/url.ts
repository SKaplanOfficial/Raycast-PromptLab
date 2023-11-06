import { utils } from "../../browsers";
import { filterString } from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the visible text content at a given URL.
 */
const URLPlaceholder: Placeholder = {
  name: "url",
  regex: /{{((url|URL)( raw=(true|false))?:.*?|https?:\/?\/?[\s\S]*?)}}/g,
  apply: async (str: string) => {
    try {
      const URL =
        str.match(/(url|URL)( raw=(true|false))?:(([^{]|{(?!{)|{{[\s\S]*?}})*?)}}/)?.[4] ||
        str.match(/https?:[\s\S]*?(?=}})/)?.[0] ||
        "";
      const raw = str.match(/(url|URL)( raw=(true|false))?:(([^{]|{(?!{)|{{[\s\S]*?}})*?)}}/)?.[3] === "true";
      if (!URL) return { result: "", url: "" };
      const urlText = raw ? await utils.getURLHTML(URL) : await utils.getTextOfWebpage(URL);
      return { result: filterString(urlText), url: filterString(urlText) };
    } catch (e) {
      return { result: "", url: "" };
    }
  },
  constant: false,
  fn: async (url: string) => {
    return (await URLPlaceholder.apply(`{{url:${url}}}`)).result;
  },
  example: "{{url:https://www.google.com}}",
  description:
    "Placeholder for the visible text content at a given URL. Accepts an optional `raw` parameter, e.g. `{{url:https://www.google.com raw=true}}`, to return the raw HTML of the page instead of the visible text.",
  hintRepresentation: "{{url:...}}",
  fullRepresentation: "Visible Text at URL",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Internet],
};

export default URLPlaceholder;
