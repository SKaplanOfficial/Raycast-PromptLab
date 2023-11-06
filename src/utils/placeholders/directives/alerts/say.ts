import { runAppleScript } from "@raycast/utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";

/**
 * Directive to speak the provided text. The placeholder will always be replaced with an empty string.
 *
 * Syntax: `{{say voice="[voice]" speed=[number] pitch=[number] volume=[number]:Message}}`
 *
 * All arguments are optional. If no voice, speed, pitch, or volume are provided, the system defaults will be used.
 */
const SayDirective: Placeholder = {
  name: "say",
  regex:
    /{{say( voice="[A-Za-z)( ._-]")?( speed=[0-9.]+?)?( pitch=([0-9.]+?))?( volume=[0-9.]+?)?:(([^{]|{(?!{)|{{[\s\S]*?}})+?)}}/g,
  apply: async (str: string) => {
    const matches = str.match(
      /{{say( voice="([A-Za-z)( ._-]+?)")?( speed=([0-9.]+?))?( pitch=([0-9.]+?))?( volume=([0-9.]+?))?:(([^{]|{(?!{)|{{[\s\S]*?}})+?)}}/,
    );
    if (matches) {
      const voice = matches[2] || undefined;
      const speed = matches[4] || undefined;
      const pitch = matches[6] || undefined;
      const volume = matches[8] || undefined;
      const query = matches[9];
      await runAppleScript(
        `say "${query}"${voice ? ` using "${voice}"` : ""}${speed ? ` speaking rate ${speed}` : ""}${
          pitch ? ` pitch ${pitch}` : ""
        }${volume ? ` volume ${volume}` : ""}`,
      );
    }
    return { result: "" };
  },
  constant: false,
  fn: async (message: string, voice?: string, speed?: string, pitch?: string, volume?: string) =>
    (
      await SayDirective.apply(
        `{{say${voice ? ` voice="${voice}"` : ""}${speed ? ` speed="${speed}"` : ""}${
          pitch ? ` pitch="${pitch}"` : ""
        }${volume ? ` volume="${volume}"` : ""}:${message}}}`,
      )
    ).result,
  example: "{{say:Hello World}}",
  description: "Directive to speak the provided text. The placeholder will always be replaced with an empty string.",
  hintRepresentation: "{{say:...}}",
  fullRepresentation: "Speak Text",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Alert],
};

export default SayDirective;
