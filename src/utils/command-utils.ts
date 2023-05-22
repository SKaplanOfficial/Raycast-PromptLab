import { runAppleScript } from "run-applescript";
import {
  addFileToSelection,
  objcImports,
  replaceAllHandler,
  rselectHandler,
  searchNearbyLocations,
  splitHandler,
  trimHandler,
} from "./scripts";
import { filterString } from "./calendar-utils";
import {
  getMatchingYouTubeVideoID,
  getTextOfWebpage,
  getYouTubeVideoTranscriptById,
  getYouTubeVideoTranscriptByURL,
} from "./context-utils";
import { exec } from "child_process";
import * as os from "os";
import { Command, CommandOptions, StoreCommand } from "./types";
import { LocalStorage, AI, open } from "@raycast/api";
import runModel from "./runModel";
import { getExtensions } from "./file-utils";

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
      await runAppleScript(`${objcImports}
      ${splitHandler}
      ${trimHandler}
      ${replaceAllHandler}
      ${rselectHandler}
      set prompt to "${prompt.replaceAll('"', '\\"')}"
      set input to "${input.replaceAll('"', '\\"')}"
      set response to "${response.replaceAll('"', '\\"')}"
      ${script}`);
    } else if (type == "zsh") {
      const runScript = (script: string): Promise<string> => {
        const shellScript = `response="${response.trim().replaceAll('"', '\\"').replaceAll("\n", "\\n")}"
        prompt="${prompt.trim().replaceAll('"', '\\"').replaceAll("\n", "\\n")}"
        input="${input.trim().replaceAll('"', '\\"').replaceAll("\n", "\\n")}"
        ${script.replaceAll("\n", " && ")}`;

        return new Promise((resolve, reject) => {
          exec(shellScript, (error, stdout) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(stdout);
          });
        });
      };
      await runScript(script);
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 * Replaces AppleScript placeholders with the output of the AppleScript.
 *
 * @param prompt The prompt to operate on.
 * @returns A promise resolving to the prompt with the `{{as:...}}` placeholders replaced.
 */
export const replaceAppleScriptPlaceholders = async (prompt: string) => {
  let subbedPrompt = prompt;
  const applescriptMatches = prompt.match(/{{as:(.*?[\s\n\r]*)*?}}/g) || [];
  for (const m of applescriptMatches) {
    const script = m.substring(5, m.length - 2);
    const output = await runAppleScript(script);
    subbedPrompt = filterString(subbedPrompt.replaceAll(m, output));
  }
  return subbedPrompt;
};

/**
 * Replaces shell script placeholders with the output of the shell script.
 *
 * @param prompt The prompt to operate on.
 * @returns A promise resolving to the prompt with the `{{shell:...}}` placeholders replaced.
 */
export const replaceShellScriptPlaceholders = async (prompt: string) => {
  let subbedPrompt = prompt;
  const shellScriptMatches = prompt.match(/{{shell:(.*?[\s\n\r]*)*?}}/g) || [];
  for (const m of shellScriptMatches) {
    const script = m.substring(8, m.length - 2);

    const runScript = (script: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        exec(script, (error, stdout) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(stdout);
        });
      });
    };

    const output = await runScript(script);
    subbedPrompt = filterString(subbedPrompt.replaceAll(m, output));
  }
  return subbedPrompt;
};

/**
 * Replaces URL placeholders with the text of the webpage.
 *
 * @param prompt The prompt to operate on.
 * @returns A promise resolving to the prompt with the `{{url:...}}` placeholders replaced.
 */
export const replaceURLPlaceholders = async (prompt: string) => {
  let subbedPrompt = prompt;
  const urlMatches = prompt.match(/{{(https?:(.| )*?)}}/g) || [];
  for (const m of urlMatches) {
    const url = encodeURI(m.substring(2, m.length - 2));
    const text = await getTextOfWebpage(url);
    subbedPrompt = subbedPrompt.replaceAll(m, filterString(text));
  }
  return subbedPrompt;
};

/**
 * Selects files specified by the `{{file:...}}` placeholder.
 *
 * @param prompt The prompt to operate on.
 * @returns A promise resolving to the prompt with the `{{file:...}}` placeholders removed.
 */
export const replaceFileSelectionPlaceholders = async (prompt: string) => {
  let subbedPrompt = prompt;
  const fileMatches = prompt.match(/{{file:[~/].*?}}/g) || [];
  for (const m of fileMatches) {
    const file = m.substring(7, m.length - 2).replace("~", os.homedir());
    addFileToSelection(file);
    subbedPrompt = subbedPrompt.replaceAll(m, "");
  }
  return subbedPrompt;
};

/**
 * Updates persistent data and replaces counter placeholders with the updated values.
 *
 * @param prompt The prompt to operate on.
 * @returns A promise resolving to the prompt with persistent data placeholders replaced.
 */
export const replaceCounterPlaceholders = async (prompt: string) => {
  let subbedPrompt = prompt;
  const incrementMatches = prompt.match(/{{increment:.*?}}/g) || [];
  const decrementMatches = prompt.match(/{{decrement:.*?}}/g) || [];

  for (const m of incrementMatches) {
    const identifier = "id-" + m.substring(12, m.length - 2);
    const value = parseInt((await LocalStorage.getItem(identifier)) || "0") + 1;
    await LocalStorage.setItem(identifier, value.toString());
    subbedPrompt = subbedPrompt.replaceAll(m, value.toString());
  }

  for (const m of decrementMatches) {
    const identifier = "id-" + m.substring(12, m.length - 2);
    const value = parseInt((await LocalStorage.getItem(identifier)) || "0") - 1;
    await LocalStorage.setItem(identifier, value.toString());
    subbedPrompt = subbedPrompt.replaceAll(m, value.toString());
  }

  return subbedPrompt;
};

/**
 * Replaces YouTube placeholders with the transcript of the corresponding YouTube video.
 * @param prompt The URL of a YouTube video or a search query to use to find a YouTube video.
 * @returns A promise resolving to the prompt with the YouTube placeholders replaced.
 */
export const replaceYouTubePlaceholders = async (prompt: string): Promise<string> => {
  let subbedPrompt = prompt;
  const youtubeMatches = prompt.match(/{{youtube:(.*?[\s\n\r]*)*?}}/g) || [];
  for (const m of youtubeMatches) {
    const specifier = m.substring(10, m.length - 2);
    if (specifier.trim().length == 0) {
      subbedPrompt = subbedPrompt.replaceAll(m, "No YouTube video specified.");
      continue;
    }
    const transcriptText = specifier.startsWith("http")
      ? await getYouTubeVideoTranscriptByURL(specifier)
      : await getYouTubeVideoTranscriptById(getMatchingYouTubeVideoID(specifier));
    subbedPrompt = subbedPrompt.replaceAll(m, filterString(transcriptText));
  }
  return subbedPrompt;
};

/**
 * Replaces nearby locations placeholders with the results of a nearby locations search.
 * @param prompt The prompt to replace placeholders in.
 * @returns A promise resolving to the prompt with the nearby locations placeholders replaced.
 */
export const replaceLocationsSearchPlaceholders = async (prompt: string): Promise<string> => {
  let subbedPrompt = prompt;
  const searchNearbyMatches = prompt.match(/{{nearbyLocations:(.*?[\s\n\r]*)*?}}/g) || [];
  for (const m of searchNearbyMatches) {
    const query = m.substring(18, m.length - 2);
    const nearbyLocations = await searchNearbyLocations(query);
    subbedPrompt = subbedPrompt.replaceAll(m, filterString(nearbyLocations));
  }
  return subbedPrompt;
};

/**
 * Replaces prompt placeholders with the response to the prompt.
 * @param prompt The prompt to replace placeholders in.
 * @returns A promise resolving to the prompt with the prompt placeholders replaced.
 */
export const replacePromptPlaceholders = async (prompt: string): Promise<string> => {
  let subbedPrompt = prompt;
  const promptMatches = prompt.match(/{{prompt:(.*?[\s\n\r]*)*?}}/g) || [];
  for (const m of promptMatches) {
    const prompt = m.substring(9, m.length - 2);
    const response = await runModel("", prompt, "");
    if (response) {
      subbedPrompt = subbedPrompt.replaceAll(m, filterString(response));
    }
  }
  return subbedPrompt;
};

/**
 * Runs commands specified by the `{{cmd:...}}` placeholder and removes the placeholder from the prompt.
 * @param prompt The prompt to operate on.
 * @returns A promise resolving to the prompt with the `{{cmd:...}}` placeholders removed.
 */
export const replaceCommandPlaceholders = async (prompt: string): Promise<string> => {
  let subbedPrompt = prompt;
  const commandMatches =
    prompt.matchAll(/{{cmd:([^:}]*[\s\n\r]*)*?(:([^:}]*[\s\n\r]*)*?)?(:([^:}]*[\s\n\r]*)*?)?}}/g) || [];

  let commandMatch = commandMatches.next();
  while (!commandMatch.done) {
    const cmd = commandMatch.value[1];
    let ext = "";
    let input = "";
    if (commandMatch.value[3] != undefined && commandMatch.value[5] == undefined) {
      input = commandMatch.value[3];
    } else if (commandMatch.value[5] != undefined) {
      ext = commandMatch.value[3];
      input = commandMatch.value[5];
    }

    const extensions = await getExtensions();
    const targetExtension = extensions.find((extension) => {
      if (ext != "") {
        return extension.name == ext || extension.title == ext;
      } else {
        return extension.commands.find((command) => command.name == cmd) != undefined;
      }
    });

    if (targetExtension != undefined) {
      const targetCommand = targetExtension.commands.find((command) => command.name == cmd);
      if (targetCommand != undefined) {
        open(targetCommand.deeplink);
      }
    }

    subbedPrompt = subbedPrompt.replaceAll(commandMatch.value[0], "");
    commandMatch = commandMatches.next();
  }

  return subbedPrompt;
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
  replacements: {
    [key: string]: () => Promise<string>;
  },
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

  // Replace simple placeholders (i.e. {{date}})
  for (const key in replacements) {
    if (prompt.includes(key)) {
      subbedPrompt = subbedPrompt.replaceAll(key, await replacements[key]());
    }
  }

  // Replace complex placeholders (i.e. shell scripts, AppleScripts, etc.)
  subbedPrompt = await replaceCounterPlaceholders(subbedPrompt);
  subbedPrompt = await replaceYouTubePlaceholders(subbedPrompt);
  subbedPrompt = await replaceLocationsSearchPlaceholders(subbedPrompt);
  subbedPrompt = await replaceAppleScriptPlaceholders(subbedPrompt);
  subbedPrompt = await replaceShellScriptPlaceholders(subbedPrompt);
  subbedPrompt = await replaceURLPlaceholders(subbedPrompt);
  subbedPrompt = await replaceFileSelectionPlaceholders(subbedPrompt);
  subbedPrompt = await replacePromptPlaceholders(subbedPrompt);
  subbedPrompt = await replaceCommandPlaceholders(subbedPrompt);

  // Replace command placeholders
  for (const cmdString of Object.values(await LocalStorage.allItems())) {
    const cmd = JSON.parse(cmdString) as Command;
    if (!disallowedCommands.includes(cmd.name) && subbedPrompt.includes(`{{${cmd.name}}}`)) {
      const cmdResponse = await AI.ask(
        await runReplacements(cmd.prompt, replacements, [cmd.name, ...disallowedCommands])
      );
      if (cmd.actionScript != undefined && cmd.actionScript.trim().length > 0 && cmd.actionScript != "None") {
        await runActionScript(cmd.actionScript, cmd.prompt, "", cmdResponse, cmd.scriptKind);
      }
      subbedPrompt = subbedPrompt.replaceAll(`{{${cmd.name}}}`, cmdResponse);
    }
  }

  return subbedPrompt;
};
