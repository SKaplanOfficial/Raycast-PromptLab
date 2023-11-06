import { runAppleScript } from "@raycast/utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";

/**
 * Directive to display a dialog with the provided text. The placeholder will be replaced with an empty string unless `input=true` is provided, in which case the placeholder will be replaced with the user's input. If the user cancels the dialog, the placeholder will be replaced with an empty string.
 *
 * Syntax: `{{dialog input=[true/false] timeout=[number] title="...":Message}}`
 *
 * The input setting, timeout, and title are optional. If no timeout is provided, the dialog will timeout after 30 seconds. If no title is provided, the title will be "Pins". The default input setting is `false`. You must provide a message.
 */
const DialogDirective: Placeholder = {
  name: "displayDialog",
  regex:
    /{{dialog( input=(true|false))?( timeout=([0-9]+))?( title="(([^{]|{(?!{)|{{[\s\S]*?}})*?)")?:(([^{]|{(?!{)|{{[\s\S]*?}})+?)}}/g,
  apply: async (str: string) => {
    const matches = str.match(
      /{{dialog( input=(true|false))?( timeout=([0-9]+))?( title="(([^{]|{(?!{)|{{[\s\S]*?}})*?)")?:(([^{]|{(?!{)|{{[\s\S]*?}})+?)}}/,
    );
    if (matches) {
      const input = matches[2] == "true";
      const timeout = parseInt(matches[4]) || 30;
      const title = matches[6] || "Pins";
      const message = matches[8];
      const result = await runAppleScript(
        `display dialog "${message.replaceAll('"', "'")}" with title "${title.replaceAll('"', "'")}"${
          input ? ' default answer ""' : ""
        } giving up after ${timeout}`,
        { timeout: timeout * 1000 },
      );
      if (input) {
        const textReturned = result.match(/(?<=text returned:)(.|[ \n\r\s])*?(?=,)/)?.[0] || "";
        return { result: textReturned.trim().replaceAll('"', "'") };
      }
    }
    return { result: "" };
  },
  constant: false,
  fn: async (message: string, title?: string, timeout?: string, input = "false") =>
    (
      await DialogDirective.apply(
        `{{dialog${input ? ` input=${input}` : ""}${timeout ? ` timeout=${timeout}` : ""}${
          title ? ` title="${title}"` : ""
        }:${message}}}`,
      )
    ).result,
  example: '{{dialog title="Info":Hello World}}',
  description:
    "Directive to display a dialog message with an optional title, timeout, and/or input field. If no timeout is provided, the alert will timeout after 10 seconds. If the input setting is `true`, the placeholder will be replaced with the user's input. Otherwise, the placeholder will be replaced with an empty string.",
  hintRepresentation: "{{dialog:...}}",
  fullRepresentation: "Display Dialog",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Alert],
};

export default DialogDirective;
