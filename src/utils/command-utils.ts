import { objcImports, replaceAllHandler, rselectHandler, splitHandler, trimHandler } from "./scripts";
import { exec } from "child_process";
import {
  Chat,
  Command,
  CommandOptions,
  ExtensionPreferences,
  LaunchSource,
  Model,
  SavedResponse,
  StoreCommand,
  isCommand,
} from "./types";
import { LocalStorage, AI, showToast, Toast, Clipboard, environment, getPreferenceValues, Color } from "@raycast/api";
import { Placeholders } from "./placeholders";
import * as fs from "fs";
import crypto from "crypto";
import path from "path";
import runModel from "./runModel";
import * as Insights from "./insights";
import { loadChat } from "./chat-utils";
import { runAppleScript } from "@raycast/utils";

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
export const getObjectJSON = (obj: Command | StoreCommand | Model | SavedResponse | Chat) => {
  const entry: { [key: string]: Command | StoreCommand | Model | SavedResponse | Chat } = {};
  if ("id" in obj && obj.id.startsWith("MO")) {
    entry[`--model-${obj.id}`] = obj;
  } else if ("id" in obj && obj.id.startsWith("SR")) {
    entry[`--saved-response-${obj.id}`] = obj;
  } else if ("id" in obj && obj.id.startsWith("CH")) {
    entry[`--chat-${obj.id}`] = obj;
  } else {
    entry[obj.name] = obj;
  }
  return JSON.stringify(entry);
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

  // Replace insight placeholders
  if (subbedPrompt.match(/{{IN.*?}}/g)) {
    const id = subbedPrompt.match(/{{(IN.*?)}}/)?.[1];
    if (id != undefined) {
      const insight = await Insights.read(id);
      if (insight != undefined) {
        subbedPrompt = subbedPrompt.replaceAll(`{{${id}}}`, `${insight.date}:${insight.description}`);
      }
    }
  }

  // Replace model placeholders
  if (subbedPrompt.match(/{{MO.*?}}/g)) {
    const id = subbedPrompt.match(/{{(MO.*?)}}/)?.[1];
    if (id != undefined) {
      const items = await LocalStorage.allItems();
      const model: Model = Object.entries(items)
        .filter(([key]) => key.startsWith("--model-"))
        .map(([, value]) => JSON.parse(value))
        .find((model) => model.id == id);
      if (model != undefined) {
        const modelName = model.name;
        subbedPrompt = subbedPrompt.replaceAll(`{{${id}}}`, modelName);
      }
    }
  }

  // Replace chat placeholders
  if (subbedPrompt.match(/{{CH.*?}}/g)) {
    const id = subbedPrompt.match(/{{(CH.*?)}}/)?.[1];
    if (id != undefined) {
      const chat = await loadChat(id);
      if (chat != undefined) {
        const lastMessage = chat.conversation.at(-1)?.text || "";
        subbedPrompt = subbedPrompt.replaceAll(`{{${id}}}`, lastMessage);
      }
    }
  }

  // Replace saved response placeholders
  if (subbedPrompt.match(/{{SR.*?}}/g)) {
    const savedResponses = await loadSavedResponses();
    for (const response of savedResponses) {
      const regexName = new RegExp(`{{SR:${response.name.trim()}}}`, "g");
      const regexId = new RegExp(`{{${response.id}}}`, "g");
      const responseMatches = subbedPrompt.match(regexName) || subbedPrompt.match(regexId) || [];
      for (const m of responseMatches) {
        subbedPrompt = subbedPrompt.replaceAll(m, response.response);
      }
    }
  }

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
  setCommands?: React.Dispatch<React.SetStateAction<Command[]>>,
  setTemplates?: React.Dispatch<React.SetStateAction<Command[]>>
) => {
  if (
    oldCommandData != undefined &&
    oldCommandData.id == newCommandData.id &&
    oldCommandData.name != newCommandData.name
  ) {
    await LocalStorage.removeItem(oldCommandData.name);
  }

  await LocalStorage.setItem(newCommandData.name, JSON.stringify(newCommandData));

  const commandData = await LocalStorage.allItems();
  const commandDataFiltered = Object.values(commandData).filter((cmd, index) => {
    return !Object.keys(commandData)[index].startsWith("--") && !Object.keys(commandData)[index].startsWith("id-");
  });

  if (setCommands != undefined) {
    setCommands([...commandDataFiltered?.map((data) => JSON.parse(data)).filter((cmd) => !cmd.template)]);
  }

  if (setTemplates != undefined) {
    setTemplates([...commandDataFiltered?.map((data) => JSON.parse(data)).filter((cmd) => cmd.template)]);
  }
};

/**
 * Saves a response to the saved responses directory.
 *
 * @param command The command that was run.
 * @param options The options that were used to run the command.
 * @param promptText The text of the prompt.
 * @param responseText The text of the response.
 * @param files The files that were selected when running the command.
 * @returns A promise resolving to true if response was saved successfully, false otherwise.
 */
export const saveResponse = async (
  command: Command | StoreCommand,
  options: CommandOptions,
  promptText: string,
  responseText: string,
  files: string[]
): Promise<{
  /**
   * True if the response was saved successfully, false otherwise.
   */
  status: boolean;

  /**
   * The path to the saved response, if it was saved successfully. Empty string otherwise.
   */
  outputPath: string;

  /**
   * The ID of the saved response, if it was saved successfully. Empty string otherwise.
   */
  id: string;
}> => {
  const preferences = getPreferenceValues<ExtensionPreferences>();
  const savedResponsesDir = path.join(environment.supportPath, "saved-responses");

  if (!fs.existsSync(savedResponsesDir)) {
    await fs.promises.mkdir(savedResponsesDir);
  }

  const namePrompt = `Generate a title for the following response: \n\n${responseText}\n\nOutput only the title, nothing else. The title must be four words long or shorter.`;
  const responseName = await runModel(namePrompt, namePrompt, "");

  const keywordsPrompt = `Generate 5 keywords for the following response: \n\n${responseText}\n\nOutput only the keywords as a comma-separated list, nothing else.`;
  const responseKeywords = await runModel(keywordsPrompt, keywordsPrompt, "");

  const savedResponse: SavedResponse = {
    name: responseName?.trim() || responseText.substring(0, 50).trim(),
    commandID: isCommand(command) ? command.id : "N/A",
    commandName: command.name,
    launchSource: isCommand(command) ? LaunchSource.LOCAL : LaunchSource.REMOTE,
    options: options,
    rawPrompt: command.prompt,
    prompt: promptText,
    response: responseText,
    files: files,
    date: new Date(),
    id: `SR${crypto.randomUUID()}`,
    favorited: false,
    keywords: responseKeywords?.split(",").map((tag) => tag.trim()) || [],
    tags: [],
  };

  const savedResponsePath = path.join(savedResponsesDir, `${savedResponse.id}.json`);
  try {
    await fs.promises.writeFile(savedResponsePath, JSON.stringify(savedResponse));
    if (preferences.useCommandStatistics) {
      await Insights.add(
        "Saved a Response",
        `Saved a response for command ${command.name}`,
        ["commands", "saved-responses"],
        []
      );
    }
  } catch (error) {
    console.error(error);
    return { status: false, outputPath: "", id: "" };
  }
  return { status: true, outputPath: savedResponsePath, id: savedResponse.id };
};

/**
 * Loads all saved responses from the saved responses directory.
 * @returns A promise resolving to an array of {@link SavedResponse} objects.
 */
export const loadSavedResponses = async (): Promise<SavedResponse[]> => {
  const savedResponsesDir = path.join(environment.supportPath, "saved-responses");
  const savedResponses: SavedResponse[] = [];
  if (fs.existsSync(savedResponsesDir)) {
    const savedResponsesFiles = await fs.promises.readdir(savedResponsesDir);
    for (const savedResponseFile of savedResponsesFiles) {
      if (savedResponseFile.startsWith(".")) {
        continue;
      }
      const savedResponsePath = path.join(savedResponsesDir, savedResponseFile);
      const savedResponse = JSON.parse(await fs.promises.readFile(savedResponsePath, "utf-8")) as SavedResponse;
      savedResponses.push(savedResponse);
    }
  }
  return savedResponses;
};

/**
 * Maps a string to a Raycast color based on the tagname's ASCII sum.
 * @param str The string to map to a color.
 * @returns A Raycast color.
 */
export const mapStringToColor = (str: string) => {
  const colorKeys = Object.keys(Color);
  const asciiSum = str.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = asciiSum % colorKeys.length;
  return Object.values(Color)[index];
};
