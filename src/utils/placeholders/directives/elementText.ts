import { getFrontmostApplication } from "@raycast/api";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";
import { runJSInActiveTab } from "../../context-utils";

/**
 * Placeholder for the text of the first element matching the given selector in the frontmost window of a supported browser.
 */
const ElementTextPlaceholder: Placeholder = {
  name: "elementText",
  regex: /{{(textOfElement|elementText)( browser="(.*)")?:(([^{]|{(?!{)|{{[\s\S]*?}})*?)}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    try {
      const specifier = str.match(
        /{{(textOfElement|elementText)( browser="(.*)")?:(([^{]|{(?!{)|{{[\s\S]*?}})*?)}}/,
      )?.[4];
      if (!specifier) return { result: "" };

      const browser = str.match(/{{(textOfElement|elementText)( browser="(.*)"):(([^{]|{(?!{)|{{[\s\S]*?}})*?)}}/)?.[3];

      const appName = browser
        ? browser
        : context?.["currentAppName"]
        ? context["currentAppName"]
        : (await getFrontmostApplication()).name;

      let js = `document.getElementById('${specifier}')?.innerText`;
      if (specifier.startsWith(".")) {
        js = `document.getElementsByClassName('${specifier.slice(1)}')[0]?.innerText`;
      } else if (specifier.startsWith("#")) {
        js = `document.getElementById('${specifier.slice(1)}')?.innerText`;
      } else if (specifier.startsWith("[")) {
        js = `document.querySelector('${specifier}')?.innerText`;
      } else if (specifier.startsWith("<") && specifier.endsWith(">")) {
        js = `document.getElementsByTagName('${specifier.slice(1, -1)}')[0]?.innerText`;
      }

      const elementText = await runJSInActiveTab(js, appName as string);
      return { result: elementText };
    } catch (e) {
      return { result: "" };
    }
  },
  dependencies: ["currentAppName"],
  constant: false,
  fn: async (specifier: string, browser?: string) =>
    (await ElementTextPlaceholder.apply(`{{elementText${browser ? ` browser="${browser}"` : ``}:${specifier}}}`))
      .result,
  example: "Summarize this: {{elementText:#article}}",
  description: "Replaced with the text content of an HTML element in the active tab of any supported browser.",
  hintRepresentation: "{{elementText}}",
  fullRepresentation: "Text of Browser Element With Specifier",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Internet],
};

export default ElementTextPlaceholder;
