import { getExtensions } from "../../file-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Directive to run a Raycast command. The placeholder will always be replaced with an empty string. Commands are specified in the format {{command:commandName:extensionName}}.
 */
const CommandPlaceholder: Placeholder = {
  name: "command",
  regex: /{{command:([^:}]*[\\s]*)*?(:([^:}]*[\\s]*)*?)?(:([^:}]*[\\s]*)*?)?}}/g,
  apply: async (str: string) => {
    const command = str.match(/command:([^:]*?)(:[^}:]*?)*(?=}})/)?.[1] || "";
    const extension = str.match(/(?<=(command:[^:]*?:))([^:]*?)(:[^}:]*?)*(?=}})/)?.[2] || "";
    const input = str.match(/(?<=(command:[^:]*?:[^:]*?:)).*?(?=}})/)?.[0] || "";

    // Locate the extension and command
    const cmd = command.trim();
    const ext = extension.trim();
    const extensions = await getExtensions();
    const targetExtension = extensions.find((extension) => {
      if (ext != "") {
        return extension.name == ext || extension.title == ext;
      } else {
        return extension.commands.find((command) => command.name == cmd) != undefined;
      }
    });

    if (targetExtension != undefined) {
      // Run the command belonging to the exact extension
      const targetCommand = targetExtension.commands.find((command) => command.name == cmd || command.title == cmd);
      if (targetCommand != undefined) {
        open(targetCommand.deeplink + (input.length > 0 ? `?fallbackText=${input}` : ``));
      }
    } else {
      // Run a command with the specified name, not necessary belonging to the target extension
      const targetCommand = extensions
        .map((extension) => extension.commands)
        .flat()
        .find((command) => command.name == cmd || command.title == cmd);
      if (targetCommand != undefined) {
        open(targetCommand.deeplink + (input.length > 0 ? `?fallbackText=${input}` : ``));
      }
    }
    return { result: "" };
  },
  constant: false,
  fn: async (command: string, extension?: string, input?: string) =>
    (
      await CommandPlaceholder.apply(
        `{{command:${command}${extension?.length ? `:${extension}${input?.length ? `:${input}` : ``}` : ``}}`,
      )
    ).result,
  example: "{{command:PromptLab Chat:PromptLab:Hello!}}",
  description:
    "Directive to run a Raycast command by name, optionally narrowing down the search to a specific extension. Input can be supplied as well.",
  hintRepresentation: "{{command:cmdName:extName:input}}",
  fullRepresentation: "Run Raycast Command",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Custom, PlaceholderCategory.Meta],
};

export default CommandPlaceholder;
