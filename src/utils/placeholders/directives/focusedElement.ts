/**
 * Placeholder for the text of the focused element in the frontmost window of a supported browser.
 */

import { getFrontmostApplication } from "@raycast/api";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";
import { runJSInActiveTab } from "../../context-utils";

const FocusedElementPlaceholder: Placeholder = {
  name: "focusedElement",
  regex:
    /{{(focusedElement|activeElement|selectedElement|focusedElementText|activeElementText|selectedElementText)( browser="([a-zA-Z]*)")?}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    try {
      const browser = str.match(
        /(focusedElement|activeElement|selectedElement|focusedElementText|activeElementText|selectedElementText)( browser=")(.*?)(")?/,
      )?.[3];
      const appName = browser
        ? browser
        : context?.["currentAppName"]
        ? context["currentAppName"]
        : (await getFrontmostApplication()).name;

      const js = `document.querySelector('div:hover').innerText`;
      const elementText = await runJSInActiveTab(js, appName as string);
      return { result: elementText };
    } catch (e) {
      return { result: "" };
    }
  },
  dependencies: ["currentAppName"],
  constant: false,
  fn: async (browser: string) =>
    (await FocusedElementPlaceholder.apply(`{{focusedElement browser="${browser}"}}`)).result,
  example: 'Summarize this: {{focusedElement browser="Safari"}}',
  description:
    "Replaced with the text content of the currently focused HTML element in the active tab of the given browser. If no browser is specified, the frontmost browser is used.",
  hintRepresentation: "{{focusedElement}}",
  fullRepresentation: "Text of Focused Browser Element",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Internet],
};

export default FocusedElementPlaceholder;
