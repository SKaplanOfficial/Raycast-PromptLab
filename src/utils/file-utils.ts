import { LocalStorage, environment } from "@raycast/api";
import * as fs from "fs";
import { runAppleScript } from "run-applescript";
import { defaultCommands } from "../data/default-commands";
import { Extension, ExtensionCommand } from "./types";
import { defaultModels } from "../data/default-models";
import { randomUUID } from "crypto";

/**
 * Installs the default prompts if they haven't been installed yet and the user hasn't input their own command set.
 *
 * @returns A promise to a void result
 */
export async function installDefaults() {
  const defaultsItem = await LocalStorage.getItem("--defaults-installed");
  if (!defaultsItem) {
    const numItems = Object.keys(await LocalStorage.allItems()).length;
    if (numItems > 0) {
      return;
    }

    for (const [key, value] of Object.entries(defaultCommands)) {
      await LocalStorage.setItem(key, value);
    }

    for (const [key, value] of Object.entries(defaultModels)) {
      await LocalStorage.setItem(key, JSON.stringify({ ...value, id: randomUUID() }));
    }

    await LocalStorage.setItem("--defaults-installed", "true");
  }
}

/**
 * Gets the selected files from Finder, even if Finder is not the active application.
 *
 * @returns A promise which resolves to the list of selected files as a comma-separated string.
 */
export async function getSelectedFiles(): Promise<string> {
  return runAppleScript(`tell application "Finder"
  set oldDelimiters to AppleScript's text item delimiters
  set AppleScript's text item delimiters to "::"
  set theSelection to selection
  if theSelection is {} then
    return
  else if (theSelection count) is equal to 1 then
      return the POSIX path of (theSelection as alias)
  else
    set thePaths to {}
    repeat with i from 1 to (theSelection count)
        copy (POSIX path of (item i of theSelection as alias)) to end of thePaths
    end repeat
    set thePathsString to thePaths as text
    set AppleScript's text item delimiters to oldDelimiters
    return thePathsString
  end if
end tell`);
}

/**
 * Gets the list of extensions installed in Raycast.
 * @returns The list of extensions as an array of {@link Extension} objects.
 */
export const getExtensions = async (): Promise<Extension[]> => {
  return new Promise((resolve, reject) => {
    const extensionsDir = environment.assetsPath.split("/").slice(0, -2).join("/");
    fs.readdir(extensionsDir, (err, files) => {
      const extensions: Extension[] = [];
      if (err) {
        console.error(err);
        reject(err);
      }

      files
        .filter((file) => !file.startsWith("."))
        .forEach((file) => {
          const extensionPath = `${extensionsDir}/${file}`;
          const packagePath = `${extensionPath}/package.json`;
          if (fs.existsSync(packagePath)) {
            const extension: Extension = {
              title: "",
              name: "",
              path: extensionPath,
              author: "",
              description: "",
              commands: [],
            };

            const content = fs.readFileSync(packagePath).toString();
            const packageJSON = JSON.parse(content);

            if (packageJSON.title) {
              extension.title = packageJSON.title;
            }

            if (packageJSON.author) {
              extension.author = packageJSON.author;
            }

            if (packageJSON.description) {
              extension.description = packageJSON.description;
            }

            if (packageJSON.author) {
              extension.author = packageJSON.author;
            }

            if (packageJSON.commands) {
              packageJSON.commands.forEach((entry: { [key: string]: string }) => {
                const command: ExtensionCommand = {
                  title: "",
                  name: "",
                  description: "",
                  deeplink: "",
                };

                if (entry.title) {
                  command.title = entry.title;
                }

                if (entry.name) {
                  command.name = entry.name;
                }

                if (entry.description) {
                  command.description = entry.description;
                }

                if (packageJSON.name && packageJSON.author && entry.name) {
                  command.deeplink = `raycast://extensions/${packageJSON.author}/${packageJSON.name}/${entry.name}`;
                }

                extension.commands.push(command);
              });
            }

            extensions.push(extension);
          }
        });
      resolve(extensions);
    });
  });
};
