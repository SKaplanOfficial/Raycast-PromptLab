import { runAppleScript } from "run-applescript";
import { objcImports, replaceAllHandler, rselectHandler, splitHandler, trimHandler } from "./scripts";
import { exec } from "child_process";
import { Command, CommandOptions, StoreCommand } from "./types";
import { LocalStorage, AI, showToast, Toast, Clipboard } from "@raycast/api";
import { Placeholders } from "./placeholders";

/**
 * Runs the action script of a PromptLab command, providing the AI response as the `response` variable.
 *
 * The following handlers are provided:
 *  - `split(theString, theDelimiter)` - Splits text around a delimiter
 *  - `trim(theString)` - Removes leading and trailing spaces from text
 *  - `replaceAll(theString, theTarget, theReplacement)` - Replaces all instances of a target string with a replacement string
 *  - `rselect(theString, theDelimiter)` - Randomly selects a string from a list of strings
 *
 * The following AppleScriptObjC frameworks are supported and automatically imported: `AVFoundation`, `CoreLocation`, `CoreMedia`, `EventKit`, `Foundation`, `GamePlayKit`, `LatentSemanticMapping`, `MapKit`, `PDFKit`, `Photos`, `Quartz`, `SafariServices`, `ScreenCaptureKit`, `ScreenSaver`, `SoundAnalysis`, `Speech`, `Vision`, and `Webkit`
 *
 * @param script The script to execute.
 * @param response The PromptLab AI response.
 */
export const runActionScript = async (
  script: string,
  prompt: string,
  input: string,
  response: string,
  type?: string
) => {
  try {
    if (type == "applescript" || type == undefined) {
      await runAppleScript(
        await Placeholders.bulkApply(`${objcImports}
      ${splitHandler}
      ${trimHandler}
      ${replaceAllHandler}
      ${rselectHandler}
      set prompt to "${prompt.replaceAll('"', '\\"').replaceAll(/(\n|\r|\t|\\)/g, "\\$1")}"
      set input to "${input.replaceAll('"', '\\"').replaceAll(/(\n|\r|\t|\\)/g, "\\$1")}"
      set response to "${response.replaceAll('"', '\\"').replaceAll(/(\n|\r|\t|\\)/g, "\\$1")}"
      ${script}`)
      );
    } else if (type == "zsh") {
      const runScript = (script: string): Promise<string> => {
        const shellScript = `response="${response
          .trim()
          .replaceAll('"', '\\"')
          .replaceAll(/(\$|\n|\r|\t|\\)/g, "\\$1")}"
        prompt="${prompt
          .trim()
          .replaceAll('"', '\\"')
          .replaceAll(/(\$|\n|\r|\t|\\)/g, "\\$1")}"
        input="${input
          .trim()
          .replaceAll('"', '\\"')
          .replaceAll(/(\$|\n|\r|\t|\\)/g, "\\$1")}"
        ${script.replaceAll("\n", " && ")}`;

        return new Promise((resolve, reject) => {
          Placeholders.bulkApply(shellScript).then((subbedScript) => {
            exec(subbedScript, (error, stdout) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(stdout);
            });
          });
        });
      };
      await runScript(script);
    }
  } catch (error) {
    console.error(error);
    showToast({
      title: "Error Running Script",
      message: (error as Error).message,
      style: Toast.Style.Failure,
      primaryAction: { title: "Copy Error", onAction: async () => await Clipboard.copy((error as Error).message) },
    });
  }
};

/**
 * Gets the importable JSON string representation of a command.
 *
 * @param command The command to get the JSON representation of.
 * @returns The JSON string representation of the command.
 */
export const getCommandJSON = (command: Command | StoreCommand) => {
  const cmdObj: { [key: string]: Command | StoreCommand } = {};
  cmdObj[command.name] = command;
  return JSON.stringify(cmdObj).replaceAll(/\\([^"])/g, "\\\\$1");
};

const camelize = (str: string) => {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};

/**
 * Run placeholder replacements on a prompt.
 *
 * @param prompt The prompt to run replacements on.
 * @param replacements The list of replacements to run.
 * @param disallowedCommands The list of commands that are not allowed to be run in command placeholders.
 * @returns A promise resolving to the prompt with all placeholders replaced.
 */
export const runReplacements = async (
  prompt: string,
  context: { [key: string]: string },
  disallowedCommands: string[],
  options?: CommandOptions
): Promise<string> => {
  let subbedPrompt = prompt;

  // Replace config placeholders
  if (options != undefined && options.setupConfig != undefined) {
    for (const field of options.setupConfig.fields) {
      const regex = new RegExp(`{{config:${camelize(field.name.trim())}}}`, "g");
      const configFieldMatches = subbedPrompt.match(regex) || [];
      for (const m of configFieldMatches) {
        subbedPrompt = subbedPrompt.replaceAll(m, (field.value as string) || "");
      }
    }
  }

  subbedPrompt = await Placeholders.bulkApply(subbedPrompt, context);

  // Replace command placeholders
  for (const cmdString of Object.values(await LocalStorage.allItems())) {
    const cmd = JSON.parse(cmdString) as Command;
    if (
      !disallowedCommands.includes(cmd.name) &&
      (subbedPrompt.includes(`{{${cmd.name}}}`) || subbedPrompt.includes(`{{${cmd.id}}}`))
    ) {
      const cmdResponse = await AI.ask(
        await runReplacements(cmd.prompt, context, [cmd.name, cmd.id, ...disallowedCommands])
      );
      if (cmd.actionScript != undefined && cmd.actionScript.trim().length > 0 && cmd.actionScript != "None") {
        await runActionScript(cmd.actionScript, cmd.prompt, "", cmdResponse, cmd.scriptKind);
      }
      subbedPrompt = subbedPrompt.replaceAll(`{{${cmd.name}}}`, cmdResponse);
      subbedPrompt = subbedPrompt.replaceAll(`{{${cmd.id}}}`, cmdResponse);
    }
  }

  return subbedPrompt;
};

/**
 * Updates a command with new data.
 * @param oldCommandData The old data object for the command.
 * @param newCommandData The new data object for the command.
 * @param setCommands The function to update the list of commands.
 */
export const updateCommand = async (
  oldCommandData: Command | undefined,
  newCommandData: Command,
  setCommands?: React.Dispatch<React.SetStateAction<Command[]>>
) => {
  if (oldCommandData != undefined && oldCommandData.name != newCommandData.name) {
    await LocalStorage.removeItem(oldCommandData.name);
  }
  await LocalStorage.setItem(newCommandData.name, JSON.stringify(newCommandData));

  const commandData = await LocalStorage.allItems();
  const commandDataFiltered = Object.values(commandData).filter((cmd, index) => {
    return (
      !Object.keys(commandData)[index].startsWith("--") &&
      !Object.keys(commandData)[index].startsWith("id-") &&
      (oldCommandData == undefined || JSON.parse(cmd).name != oldCommandData.name)
    );
  });

  if (setCommands != undefined) {
    setCommands([...commandDataFiltered?.map((data) => JSON.parse(data)), newCommandData]);
  }
};
