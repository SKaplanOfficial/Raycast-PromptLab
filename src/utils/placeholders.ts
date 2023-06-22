/* eslint-disable @typescript-eslint/no-unused-vars */ // Disable since many placeholder functions have unused parameters that are kept for consistency.
import { environment, getFrontmostApplication, getSelectedText, showHUD, showToast } from "@raycast/api";
import { Clipboard } from "@raycast/api";
import { runAppleScript } from "run-applescript";
import { SupportedBrowsers, getCurrentURL, getTextOfWebpage } from "./context-utils";
import * as fs from "fs";
import * as os from "os";
import * as crypto from "crypto";
import * as vm from "vm";
import { execSync } from "child_process";
import path from "path";
import { StorageKeys } from "./constants";
import { getStorage, setStorage } from "./storage-utils";

/**
 * A placeholder type that associates Regex patterns with functions that applies the placeholder to a string, rules that determine whether or not the placeholder should be replaced, and aliases that can be used to achieve the same result.
 */
export type Placeholder = {
  [key: string]: {
    /**
     * The detailed name of the placeholder.
     */
    name: string;

    /**
     * The aliases for the placeholder. Any of these aliases can be used in place of the placeholder to achieve the same result.
     */
    aliases?: string[];

    /**
     * The rules that determine whether or not the placeholder should be replaced. If any of these rules return true, the placeholder will be replaced. If no rules are provided, the placeholder will always be replaced.
     */
    rules: ((str: string, context?: { [key: string]: string }) => Promise<boolean>)[];

    /**
     * The function that applies the placeholder to a string.
     * @param str The string to apply the placeholder to.
     * @returns The string with the placeholder applied.
     */
    apply: (str: string, context?: { [key: string]: string }) => Promise<{ result: string; [key: string]: string }>;

    /**
     * The keys of the result object relevant to the placeholder. When placeholders are applied in bulk, using the {@link as_rep} and/or {@link js_rep}, this list is used to determine which keys to return as well as to make optimizations when determining which placeholders to apply. The first key in the list is the key for the placeholder's value.
     */
    result_keys?: string[];

    /**
     * The dependencies of the placeholder. When placeholders are applied in bulk, using the {@link as_rep} and/or {@link js_rep}, this list is used to determine the order in which placeholders are applied.
     */
    dependencies?: string[];
  };
};

/**
 * Placeholder specification.
 */
const placeholders: Placeholder = {
  /**
   * Directive to reset the value of a persistent variable to its initial value. If the variable does not exist, nothing will happen. The placeholder will always be replaced with an empty string.
   */
  "{{reset [a-zA-Z0-9_]+}}": {
    name: "resetPersistentVariable",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const matches = str.match(/{{reset ([a-zA-Z0-9_]+)}}/);
      if (matches) {
        const key = matches[1];
        const initialValue = await resetPersistentVariable(key);
        await setPersistentVariable(key, initialValue);
      }
      return { result: "" };
    },
  },

  /**
   * Directive to get the value of a persistent variable. If the variable does not exist, the placeholder will be replaced with an empty string.
   */
  "{{get [a-zA-Z0-9_]+}}": {
    name: "getPersistentVariable",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const matches = str.match(/{{get ([a-zA-Z0-9_]+)}}/);
      if (matches) {
        const key = matches[1];
        return { result: (await getPersistentVariable(key)) || "" };
      }
      return { result: "" };
    },
  },

  /**
   * Directive to delete a persistent variable. If the variable does not exist, nothing will happen. The placeholder will always be replaced with an empty string.
   */
  "{{delete [a-zA-Z0-9_]+}}": {
    name: "deletePersistentVariable",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const matches = str.match(/{{delete ([a-zA-Z0-9_]+)}}/);
      if (matches) {
        const key = matches[1];
        await deletePersistentVariable(key);
      }
      return { result: "" };
    },
  },

  /**
   * Directive/placeholder to ask the user for input via a dialog window. The placeholder will be replaced with the user's input. If the user cancels the dialog, the placeholder will be replaced with an empty string.
   */
  "{{input( prompt=(\"|').*?(\"|'))?}}": {
    name: "input",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const pinsIcon = path.join(environment.assetsPath, "pins.icns");
      const prompt = str.match(/(?<=prompt=("|')).*?(?=("|'))/)?.[0] || "Input:";
      const res = await runAppleScript(`try
          return text returned of (display dialog "${prompt}" default answer "" giving up after 60 with title "Input" with icon (POSIX file "${pinsIcon}"))
        on error
          return ""
        end try`);
      return { result: res, input: res };
    },
    result_keys: ["input"],
  },

  /**
   * Directive/placeholder to execute a Siri Shortcut by name, optionally supplying input, and insert the result. If the result is null, the placeholder will be replaced with an empty string.
   */
  "{{shortcut:([\\s\\S]+?)( input=(\"|').*?(\"|'))?}}": {
    name: "runSiriShortcut",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const matches = str.match(/{{shortcut:([\s\S]+?)( input=("|')(.*?)("|'))?}}/);
      if (matches) {
        const shortcutName = matches[1];
        const input = matches[4] || "";
        const result = await runAppleScript(`tell application "Shortcuts Events"
          set res to run shortcut "${shortcutName}" with input "${input}"
          if res is not missing value then
            return res
          else
            return ""
          end if 
        end tell`);
        return { result: result || "" };
      }
      return { result: "" };
    },
  },

  /**
   * Placeholder for the text currently stored in the clipboard. If the clipboard is empty, this placeholder will not be replaced. Most clipboard content supplies a string format, such as file names when copying files in Finder.
   */
  "{{clipboardText}}": {
    name: "clipboardText",
    aliases: ["{{clipboard}}"],
    rules: [
      async (str: string, context?: { [key: string]: string }) => {
        try {
          return (await Clipboard.readText()) !== "";
        } catch (e) {
          return false;
        }
      },
    ],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const text = (await Clipboard.readText()) || "";
        return { result: text, clipboardText: text };
      } catch (e) {
        return { result: "", clipboardText: "" };
      }
    },
    result_keys: ["clipboardText"],
  },

  /**
   * Placeholder for the currently selected text. If no text is selected, this placeholder will not be replaced.
   */
  "{{selectedText}}": {
    name: "selectedText",
    rules: [
      async (str: string, context?: { [key: string]: string }) => {
        try {
          const text = await getSelectedText();
          return text !== "";
        } catch (e) {
          return false;
        }
      },
    ],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const text = await getSelectedText();
        return { result: text, selectedText: text };
      } catch (e) {
        return { result: "", selectedText: "" };
      }
    },
    result_keys: ["selectedText"],
  },

  /**
   * Placeholder for the paths of the currently selected files in Finder as a comma-separated list. If no files are selected, this placeholder will not be replaced.
   */
  "{{selectedFiles}}": {
    name: "selectedFiles",
    aliases: ["{{selectedFile}}"],
    rules: [
      async (str: string, context?: { [key: string]: string }) => {
        try {
          const data = await runAppleScript(
            `tell application "Finder"
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
          end tell`,
            { humanReadableOutput: true }
          );
          return data.split("::").length > 0;
        } catch (e) {
          return false;
        }
      },
    ],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (!context || !("selectedFiles" in context)) return { result: "", selectedFiles: "" };
      try {
        const files =
          context && "selectedFiles" in context
            ? context["selectedFiles"]
            : await runAppleScript(
                `tell application "Finder"
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
              return thePathsString
            end if
          end tell`
              );
        return { result: files, selectedFiles: files };
      } catch (e) {
        return { result: "", selectedFiles: "" };
      }
    },
    result_keys: ["selectedFiles"],
  },

  /**
   * Placeholder for the contents of the currently selected files in Finder as a newline-separated list. If no files are selected, this placeholder will not be replaced.
   */
  "{{selectedFileContents}}": {
    name: "Selected File Contents",
    aliases: [
      "{{selectedFilesContents}}",
      "{{selectedFileContent}}",
      "{{selectedFilesContent}}",
      "{{selectedFileText}}",
      "{{selectedFilesText}}",
      "{{contents}}",
    ],
    rules: [
      async (str: string, context?: { [key: string]: string }) => {
        try {
          const data = await runAppleScript(`tell application "Finder"
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
          const files = data.split("::");
          return files.length > 0;
        } catch (e) {
          return false;
        }
      },
    ],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (!context || !("selectedFiles" in context)) return { result: "", selectedFileContents: "", selectedFiles: "" };
      try {
        const data = context && "selectedFiles" in context ? context["selectedFiles"] : await runAppleScript(`tell application "Finder"
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
      end tell`)
        const files = data.split("::");
        const fileContents = files.map((file) => fs.readFileSync(file)).join("\n\n");
        return { result: fileContents, selectedFileContents: fileContents, selectedFiles: data };
      } catch (e) {
        return { result: "", selectedFileContents: "", selectedFiles: "" };
      }
    },
    result_keys: ["selectedFileContents"],
  },

  /**
   * Placeholder for the name of the current application. Barring any issues, this should always be replaced.
   */
  "{{currentAppName}}": {
    name: "currentAppName",
    aliases: ["{{currentApp}}", "{{currentApplication}}", "{{currentApplicationName}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const app = (await getFrontmostApplication()).name || "";
        return { result: app, currentAppName: app };
      } catch (e) {
        return { result: "", currentAppName: "" };
      }
    },
    result_keys: ["currentAppName"],
  },

  /**
   * Placeholder for the path of the current application. Barring any issues, this should always be replaced.
   */
  "{{currentAppPath}}": {
    name: "currentAppPath",
    aliases: ["{{currentApplicationPath}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const appPath = (await getFrontmostApplication()).path || "";
        return { result: appPath, currentAppPath: appPath };
      } catch (e) {
        return { result: "", currentAppPath: "" };
      }
    },
    result_keys: ["currentAppPath"],
  },

  /**
   * Placeholder for the current working directory. If the current application is not Finder, this placeholder will not be replaced.
   */
  "{{currentDirectory}}": {
    name: "currentDirectory",
    rules: [
      async (str: string, context?: { [key: string]: string }) => {
        try {
          return (await getFrontmostApplication()).name == "Finder";
        } catch (e) {
          return false;
        }
      },
    ],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const dir = await runAppleScript(
        `tell application "Finder" to return POSIX path of (insertion location as alias)`
      );
      return { result: dir, currentDirectory: dir };
    },
    result_keys: ["currentDirectory"],
  },

  /**
   * Placeholder for the current URL in any supported browser. See {@link SupportedBrowsers} for the list of supported browsers. If the current application is not a supported browser, this placeholder will not be replaced.
   */
  "{{currentURL}}": {
    name: "currentURL",
    aliases: ["{{currentTabURL}}"],
    rules: [
      async (str: string, context?: { [key: string]: string }) => {
        try {
          return SupportedBrowsers.includes((await getFrontmostApplication()).name);
        } catch (e) {
          return false;
        }
      },
    ],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const appName = context?.["currentAppName"]
          ? context["currentAppName"]
          : (await getFrontmostApplication()).name;
        const url = await getCurrentURL(appName);
        return { result: url, currentURL: url, currentAppName: appName };
      } catch (e) {
        return { result: "", currentURL: "", currentAppName: "" };
      }
    },
    result_keys: ["currentURL", "currentAppName"],
    dependencies: ["currentAppName"],
  },

  /**
   * Placeholder for the visible text of the current tab in any supported browser. See {@link SupportedBrowsers} for the list of supported browsers. If the current application is not a supported browser, this placeholder will not be replaced.
   */
  "{{currentTabText}}": {
    name: "currentTabText",
    aliases: ["{{tabText}}"],
    rules: [
      async (str: string, context?: { [key: string]: string }) => {
        try {
          return SupportedBrowsers.includes((await getFrontmostApplication()).name);
        } catch (e) {
          return false;
        }
      },
    ],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const appName = context?.["currentAppName"]
          ? context["currentAppName"]
          : (await getFrontmostApplication()).name;
        const URL = context?.["currentURL"] ? context["currentURL"] : await getCurrentURL(appName);
        const URLText = await getTextOfWebpage(URL);
        return { result: URLText, currentTabText: URLText, currentAppName: appName, currentURL: URL };
      } catch (e) {
        return { result: "", currentTabText: "", currentAppName: "", currentURL: "" };
      }
    },
    result_keys: ["currentTabText", "currentURL", "currentAppName"],
    dependencies: ["currentAppName", "currentURL"],
  },

  /**
   * Placeholder for the username of the currently logged-in user. Barring any issues, this should always be replaced.
   */
  "{{user}}": {
    name: "user",
    aliases: ["{{username}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const user = os.userInfo().username;
        return { result: user, user: user };
    },
    result_keys: ["user"],
  },

  /**
   * Placeholder for the home directory of the currently logged-in user. Barring any issues, this should always be replaced.
   */
  "{{homedir}}": {
    name: "homedir",
    aliases: ["{{homeDirectory}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const dir = os.homedir();
        return { result: dir, homedir: dir };
    },
    result_keys: ["homedir"],
  },

  /**
   * Placeholder for the hostname of the current machine. Barring any issues, this should always be replaced.
   */
  "{{hostname}}": {
    name: "hostname",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const name = os.hostname();
        return { result: name, hostname: name };
    },
    result_keys: ["hostname"],
  },

  /**
   * Placeholder for the list of names of all Siri Shortcuts on the current machine. The list is comma-separated.
   */
  "{{shortcuts}}": {
    name: "shortcuts",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const shortcuts = context && "shortcuts" in context ? context["shortcuts"] : await runAppleScript(`tell application "Shortcuts Events" to return name of every shortcut`);
        return { result: shortcuts, shortcuts: shortcuts };
    },
    result_keys: ["shortcuts"],
  },

  /**
   * Placeholder for the current date supporting an optional format argument. Defaults to "Month Day, Year". Barring any issues, this should always be replaced.
   */
  "{{date( format=(\"|').*?(\"|'))?}}": {
    name: "date",
    aliases: ["{{currentDate( format=(\"|').*?(\"|'))?}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const format = str.match(/(?<=format=("|')).*?(?=("|'))/)?.[0] || "MMMM d, yyyy";
      const dateStr = context && "date" in context ? context["date"] : await runAppleScript(`use framework "Foundation"
        set currentDate to current application's NSDate's alloc()'s init()
        try
          set formatter to current application's NSDateFormatter's alloc()'s init()
          set format to "${format}"
          formatter's setAMSymbol:"AM"
          formatter's setPMSymbol:"PM"
          formatter's setDateFormat:format
          return (formatter's stringFromDate:currentDate) as string
        end try`);
        return { result: dateStr, date: dateStr };
    },
    result_keys: ["date"],
  },

  /**
   * Placeholder for the current day of the week, e.g. "Monday", using en-US as the default locale. Supports an optional locale argument. Barring any issues, this should always be replaced.
   */
  "{{day( locale=(\"|').*?(\"|'))?}}": {
    name: "day",
    aliases: [
      "{{dayName( locale=(\"|').*?(\"|'))?}}",
      "{{currentDay( locale=(\"|').*?(\"|'))?}}",
      "{{currentDayName( locale=(\"|').*?(\"|'))?}}",
    ],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const locale = str.match(/(?<=locale=("|')).*?(?=("|'))/)?.[0] || "en-US";
      const day = new Date().toLocaleDateString(locale, { weekday: "long" });
        return { result: day, day: day };
    },
    result_keys: ["day"],
  },

  /**
   * Placeholder for the current time supporting an optional format argument. Defaults to "Hour:Minute:Second AM/PM". Barring any issues, this should always be replaced.
   */
  "{{time( format=(\"|').*?(\"|'))?}}": {
    name: "time",
    aliases: ["{{currentTime( format=(\"|').*?(\"|'))?}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const format = str.match(/(?<=format=("|')).*?(?=("|'))/)?.[0] || "HH:mm:s a";
      const time = context && "time" in context ? context["time"] : await runAppleScript(`use framework "Foundation"
        set currentDate to current application's NSDate's alloc()'s init()
        try
          set formatter to current application's NSDateFormatter's alloc()'s init()
          set format to "${format}"
          formatter's setAMSymbol:"AM"
          formatter's setPMSymbol:"PM"
          formatter's setDateFormat:format
          return (formatter's stringFromDate:currentDate) as string
        end try`);
        return { result: time, time: time };
    },
    result_keys: ["time"],
  },

  /**
   * Placeholder for the default language for the current user. Barring any issues, this should always be replaced.
   */
  "{{systemLanguage}}": {
    name: "systemLanguage",
    aliases: ["{{language}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const lang = context && "lang" in context ? context["lang"] : await runAppleScript(`use framework "Foundation"
                set locale to current application's NSLocale's autoupdatingCurrentLocale()
                set langCode to locale's languageCode()
                return (locale's localizedStringForLanguageCode:langCode) as text`);
        return { result: lang, systemLanguage: lang };
    },
    result_keys: ["systemLanguage"],
  },

  //   /**
  //    * Placeholder for the last application focused before the current application. If there is no previous application, this placeholder will not be replaced.
  //    */
  //   "{{previousApp}}": {
  //     name: "Previous Application",
  //     aliases: [
  //       "{{previousAppName}}",
  //       "{{lastApp}}",
  //       "{{lastAppName}}",
  //       "{{previousApplication}}",
  //       "{{lastApplication}}",
  //       "{{previousApplicationName}}",
  //       "{{lastApplicationName}}",
  //     ],
  //     rules: [
  //       async (str: string, context?: { [key: string]: string }) => {
  //         try {
  //           const recents = await getStorage(StorageKey.RECENT_APPS);
  //           if (!recents) return false;
  //           if (!Array.isArray(recents)) return false;
  //           return recents.length > 1;
  //         } catch (e) {
  //           return false;
  //         }
  //       },
  //     ],
  //     apply: async (str: string, context?: { [key: string]: string }) => {
  //       const recents = await getStorage(StorageKey.RECENT_APPS);
  //       if (Array.isArray(recents)) {
  //         return recents[1].name;
  //       }
  //       return "";
  //     },
  //   },

  /**
   * Placeholder for a unique UUID. UUIDs are tracked in the {@link StorageKey.USED_UUIDS} storage key. The UUID will be unique for each use of the placeholder (but there is no guarantee that it will be unique across different instances of the extension, e.g. on different computers).
   */
  "{{uuid}}": {
    name: "uuid",
    aliases: ["{{UUID}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      let newUUID = crypto.randomUUID();
      const usedUUIDs = await getStorage(StorageKeys.USED_UUIDS);
      if (Array.isArray(usedUUIDs)) {
        while (usedUUIDs.includes(newUUID)) {
          newUUID = crypto.randomUUID();
        }
        usedUUIDs.push(newUUID);
        await setStorage(StorageKeys.USED_UUIDS, usedUUIDs);
      } else {
        await setStorage(StorageKeys.USED_UUIDS, [newUUID]);
      }
      return { result: newUUID, uuid: newUUID };
    },
    result_keys: ["uuid" + crypto.randomUUID()],
  },

  /**
   * Placeholder for a list of all previously used UUIDs since Pins' LocalStorage was last reset.
   */
  "{{usedUUIDs}}": {
    name: "usedUUIDs",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const usedUUIDs = await getStorage(StorageKeys.USED_UUIDS);
      if (Array.isArray(usedUUIDs)) {
        return { result: usedUUIDs.join(", "), usedUUIDs: usedUUIDs.join(", ") };
      }
      return { result: "", usedUUIDs: "" };
    },
    result_keys: ["usedUUIDs"],
  },

  /**
   * Placeholder for the visible text content at a given URL.
   */
  "{{(url|URL):.*?}}": {
    name: "url",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const URL = str.match(/(?<=(url|URL):).*?(?=}})/)?.[0];
        if (!URL) return { result: "", url: "" };
        const urlText = await getTextOfWebpage(URL);
        return { result: urlText, url: urlText };
      } catch (e) {
        return { result: "", url: "" };
      }
    },
    result_keys: ["url" + crypto.randomUUID()],
  },

  /**
   * Placeholder for the raw text of a file at the given path. The path can be absolute or relative to the user's home directory (e.g. `~/Desktop/file.txt`). The file must be readable as UTF-8 text, or the placeholder will be replaced with an empty string.
   */
  "{{file:(.|^[\\s\\n\\r])*?}}": {
    name: "file",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const target = str.match(/(?<=(file:)).*?(?=}})/)?.[0];
      if (!target) return { result: "", file: "" };

      const filePath = target.startsWith("~") ? target.replace("~", os.homedir()) : target;
      if (filePath == "") return { result: "", file: "" };

      if (!filePath.startsWith("/")) return { result: "", file: "" };

      try {
        const text = fs.readFileSync(filePath, "utf-8");
        return { result: text, file: text };
      } catch (e) {
        return { result: "", file: "" };
      }
    },
    result_keys: ["file" + crypto.randomUUID()],
  },

  /**
   * Directive to copy the provided text to the clipboard. The placeholder will always be replaced with an empty string.
   */
  "{{copy:[^}]*?}}": {
    name: "copy",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const text = str.match(/(?<=(copy:))[^}]*?(?=}})/)?.[0];
      if (!text) return { result: "" };
      await Clipboard.copy(text);
      if (environment.commandName == "index") {
        await showHUD("Copied to Clipboard");
      } else {
        await showToast({ title: "Copied to Clipboard" });
      }
      return { result: "" };
    }
  },

  /**
   * Directive to paste the provided text in the frontmost application. The placeholder will always be replaced with an empty string.
   */
  "{{paste:[^}]*?}}": {
    name: "Paste from Clipboard",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const text = str.match(/(?<=(paste:))[^}]*?(?=}})/)?.[0];
      if (!text) return { result: "" };
      await Clipboard.paste(text);
      await showHUD("Pasted Into Frontmost App");
      return { result: "" };
    },
  },

  /**
   * Directive to set the value of a persistent variable. If the variable does not exist, it will be created. The placeholder will always be replaced with an empty string.
   */
  "{{set [a-zA-Z0-9_]+:.*?}}": {
    name: "Set Persistent Variable",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const matches = str.match(/{{set ([a-zA-Z0-9_]+):(.*?)}}/);
      if (matches) {
        const key = matches[1];
        const value = matches[2];
        await setPersistentVariable(key, value);
      }
      return { result: "" };
    },
  },

  /**
   * Placeholder for output of an AppleScript script. If the script fails, this placeholder will be replaced with an empty string. No sanitization is done in the script input; the expectation is that users will only use this placeholder with trusted scripts.
   */
  "{{(as|AS):(.|[ \\n\\r\\s])*?}}": {
    name: "applescript",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const script = str.match(/(?<=(as|AS):)(.|[ \n\r\s])*?(?=}})/)?.[0];
        if (!script) return { result: "", applescript: ""};
        const res = await runAppleScript(`try
          ${script}
          end try`);
        return { result: res, applescript: res };
      } catch (e) {
        return { result: "", applescript: "" };
      }
    },
  },

  /**
   * Placeholder for output of a JavaScript for Automation script. If the script fails, this placeholder will be replaced with an empty string. No sanitization is done in the script input; the expectation is that users will only use this placeholder with trusted scripts.
   */
  "{{(jxa|JXA):(.|[ \\n\\r\\s])*?}}": {
    name: "JavaScript for Automation",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const script = str.match(/(?<=(jxa|JXA):)(.|[ \n\r\s])*?(?=}})/)?.[0];
        if (!script) return { result: "", jxa: ""};
        const res = execSync(
          `osascript -l JavaScript -e "${script
            .replaceAll('"', '\\"')
            .replaceAll("`", "\\`")
            .replaceAll("$", "\\$")
            .replaceAll(new RegExp(/[\n\r]/, "g"), " \\\n\n")}"`
        ).toString();
        return { result: res, jxa: res };
      } catch (e) {
        return { result: "", jxa: "" };
      }
    },
  },

  /**
   * Placeholder for output of a shell script. If the script fails, this placeholder will be replaced with an empty string. No sanitization is done on the script input; the expectation is that users will only use this placeholder with trusted scripts.
   */
  "{{shell( .*)?:(.|[ \\n\\r\\s])*?}}": {
    name: "Shell Script",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const script = str.match(/(?<=shell( .*)?:)(.|[ \n\r\s])*?(?=}})/)?.[0];
        if (!script) return { result: "", shell: ""};

        const bin =
          str
            .matchAll(/(?<=shell)(.*)?(?=:(.|[ \n\r\s])*?}})/g)
            .next()
            .value?.[0]?.trim() || "/bin/zsh";
        const res = execSync(script, { shell: bin }).toString();
        return { result: res, shell: res };
      } catch (e) {
        return { result: "", shell: "" };
      }
    },
  },

  /**
   * Placeholder for output of a JavaScript script. If the script fails, this placeholder will be replaced with an empty string. The script is run in a sandboxed environment.
   */
  "{{(js|JS):(.|[ \\n\\r\\s])*?}}": {
    name: "JavaScript",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const script = str.match(/(?<=(js|JS):)(.|[ \n\r\s])*?(?=}})/)?.[0];
        if (!script) return { result: "", js: ""};
        const sandbox = {
          clipboardText: async () => await Placeholders.allPlaceholders["{{clipboardText}}"].apply("{{clipboardText}}"),
          selectedText: async () => await Placeholders.allPlaceholders["{{selectedText}}"].apply("{{selectedText}}"),
          currentAppName: async () =>
            await Placeholders.allPlaceholders["{{currentAppName}}"].apply("{{currentAppName}}"),
          currentAppPath: async () =>
            await Placeholders.allPlaceholders["{{currentAppPath}}"].apply("{{currentAppPath}}"),
          currentDirectory: async () =>
            await Placeholders.allPlaceholders["{{currentDirectory}}"].apply("{{currentDirectory}}"),
          currentURL: async () => await Placeholders.allPlaceholders["{{currentURL}}"].apply("{{currentURL}}"),
          user: async () => await Placeholders.allPlaceholders["{{user}}"].apply("{{user}}"),
          homedir: async () => await Placeholders.allPlaceholders["{{homedir}}"].apply("{{homedir}}"),
          hostname: async () => await Placeholders.allPlaceholders["{{hostname}}"].apply("{{hostname}}"),
          date: async (format?: string) =>
            await Placeholders.allPlaceholders[`{{date( format=("|').*?("|'))?}}`].apply(
              `{{date${format ? ` format="${format}"` : ""}}}`
            ),
          time: async () => await Placeholders.allPlaceholders[`{{time( format=("|').*?("|'))?}}`].apply("{{time}}"),
          day: async () => await Placeholders.allPlaceholders[`{{day( locale=("|').*?("|'))?}}`].apply("{{day}}"),
          currentTabText: async () =>
            await Placeholders.allPlaceholders["{{currentTabText}}"].apply("{{currentTabText}}"),
          systemLanguage: async () =>
            await Placeholders.allPlaceholders["{{systemLanguage}}"].apply("{{systemLanguage}}"),
          previousApp: async () => await Placeholders.allPlaceholders["{{previousApp}}"].apply("{{previousApp}}"),
          uuid: async () => await Placeholders.allPlaceholders["{{uuid}}"].apply("{{uuid}}"),
          usedUUIDs: async () => await Placeholders.allPlaceholders["{{usedUUIDs}}"].apply("{{usedUUIDs}}"),
          url: async (url: string) => await Placeholders.allPlaceholders["{{(url|URL):.*?}}"].apply(`{{url:${url}}}`),
          as: async (script: string) =>
            await Placeholders.allPlaceholders["{{(as|AS):(.|[ \\n\\r\\s])*?}}"].apply(`{{as:${script}}}`),
          jxa: async (script: string) =>
            await Placeholders.allPlaceholders["{{(jxa|JXA):(.|[ \\n\\r\\s])*?}}"].apply(`{{jxa:${script}}}`),
          shell: async (script: string) =>
            await Placeholders.allPlaceholders["{{shell( .*)?:(.|[ \\n\\r\\s])*?}}"].apply(`{{shell:${script}}}`),
          previousPinName: async () =>
            await Placeholders.allPlaceholders["{{previousPinName}}"].apply("{{previousPinName}}"),
          previousPinTarget: async () =>
            await Placeholders.allPlaceholders["{{previousPinTarget}}"].apply("{{previousPinTarget}}"),
          reset: async (variable: string) =>
            await Placeholders.allPlaceholders["{{reset [a-zA-Z0-9_]+}}"].apply(`{{reset ${variable}}}`),
          get: async (variable: string) =>
            await Placeholders.allPlaceholders["{{get [a-zA-Z0-9_]+}}"].apply(`{{get ${variable}}}`),
          delete: async (variable: string) =>
            await Placeholders.allPlaceholders["{{delete [a-zA-Z0-9_]+}}"].apply(`{{delete ${variable}}}`),
          set: async (variable: string, value: string) =>
            await Placeholders.allPlaceholders["{{set [a-zA-Z0-9_]+:.*?}}"].apply(`{{set ${variable}:${value}}}`),
          shortcut: async (name: string) =>
            await Placeholders.allPlaceholders["{{shortcut:([\\s\\S]+?)( input=(\"|').*?(\"|'))?}}"].apply(
              `{{shortcut:${name}}}`
            ),
          selectedFiles: async () => await Placeholders.allPlaceholders["{{selectedFiles}}"].apply("{{selectedFiles}}"),
          selectedFileContents: async () =>
            await Placeholders.allPlaceholders["{{selectedFileContents}}"].apply("{{selectedFileContents}}"),
          shortcuts: async () => await Placeholders.allPlaceholders["{{shortcuts}}"].apply("{{shortcuts}}"),
          copy: async (text: string) => await Placeholders.allPlaceholders["{{copy:[^}]*?}}"].apply(`{{copy:${text}}}`),
          paste: async (text: string) =>
            await Placeholders.allPlaceholders["{{paste:[^}]*?}}"].apply(`{{paste:${text}}}`),
          ignore: async (text: string) =>
            await Placeholders.allPlaceholders["{{(ignore|IGNORE):[^}]*?}}"].apply(`{{ignore:${text}}}`),
        };
        const res = await vm.runInNewContext(script, sandbox, { timeout: 1000, displayErrors: true });
        return { result: res, js: script };
      } catch (e) {
        return { result: "", js: "" };
      }
    },
  },

  /**
   * Directive to ignore all content within the directive. Allows placeholders and directives to run without influencing the output.
   */
  "{{(ignore|IGNORE):[^}]*?}}": {
    name: "Ignore Content",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      return { result: "" }
    },
  },
};

/**
 * Applies placeholders to a single string.
 * @param str The string to apply placeholders to.
 * @returns The string with placeholders applied.
 */
const applyToString = async (str: string, context?: { [key: string]: string }) => {
  let subbedStr = str;
  const placeholderDefinition = Object.entries(placeholders);
  for (const [key, placeholder] of placeholderDefinition) {
    if (
      !subbedStr.match(new RegExp(key, "g")) &&
      (placeholder.aliases?.every((alias) => !subbedStr.match(new RegExp(alias, "g"))) || !placeholder.aliases?.length)
    )
      continue;
    if (placeholder.aliases && placeholder.aliases.some((alias) => subbedStr.indexOf(alias) != -1)) {
      for (const alias of placeholder.aliases) {
        while (subbedStr.match(new RegExp(alias, "g")) != undefined) {
          subbedStr = subbedStr.replace(new RegExp(alias), (await placeholder.apply(subbedStr, context)).result);
        }
      }
    } else {
      while (subbedStr.match(new RegExp(key, "g")) != undefined) {
        subbedStr = subbedStr.replace(new RegExp(key), (await placeholder.apply(subbedStr, context)).result);
      }
    }
  }
  return subbedStr;
};

/**
 * Applies placeholders to an array of strings.
 * @param strs The array of strings to apply placeholders to.
 * @returns The array of strings with placeholders applied.
 */
const applyToStrings = async (strs: string[], context?: { [key: string]: string }) => {
  const subbedStrs: string[] = [];
  for (const str of strs) {
    subbedStrs.push(await applyToString(str));
  }
  return subbedStrs;
};

/**
 * Applies placeholders to the value of a single key in an object.
 * @param obj The object to apply placeholders to.
 * @param key The key of the value to apply placeholders to.
 * @returns The object with placeholders applied.
 */
const applyToObjectValueWithKey = async (
  obj: { [key: string]: unknown },
  key: string,
  context?: { [key: string]: string }
) => {
  const value = obj[key];
  if (typeof value === "string") {
    return await applyToString(value);
  } else if (Array.isArray(value)) {
    return await applyToStrings(value);
  } else if (typeof value === "object") {
    return await applyToObjectValuesWithKeys(
      value as { [key: string]: unknown },
      Object.keys(value as { [key: string]: unknown })
    );
  } else {
    return (value || "undefined").toString();
  }
};

/**
 * Applies placeholders to an object's values, specified by keys.
 * @param obj The object to apply placeholders to.
 * @param keys The keys of the object to apply placeholders to.
 * @returns The object with placeholders applied.
 */
const applyToObjectValuesWithKeys = async (
  obj: { [key: string]: unknown },
  keys: string[],
  context?: { [key: string]: string }
) => {
  const subbedObj: { [key: string]: unknown } = {};
  for (const key of keys) {
    subbedObj[key] = await applyToObjectValueWithKey(obj, key);
  }
  return subbedObj;
};

const bulkApply = async (str: string): Promise<string> => {
  let subbedStr = str;
  const result: { [key: string]: string } = {};
  for (const [key, placeholder] of Object.entries(placeholders)) {
    // Skip if the placeholder isn't in the string
    if (!subbedStr.match(new RegExp(key, "g"))) continue;

    // Skip if all result keys are already in the result (i.e. the placeholder has already been applied to the string as a dependency of another placeholder)
    const result_keys = placeholder.result_keys?.splice(0)?.filter((key) => !(key in result));
    if (result_keys?.length) {
      for (const dependencyName of placeholder.dependencies || []) {
        // Get the placeholder that matches the dependency name
        const dependency = Object.values(placeholders).find((placeholder) => placeholder.name == dependencyName);
        if (!dependency) continue;

        // Apply the dependency placeholder and store the result
        const intermediateResult = await dependency.apply(subbedStr, result);
        subbedStr = subbedStr.replace(new RegExp(key, "g"), intermediateResult.result);
        for (const [key, value] of Object.entries(intermediateResult)) {
          result[key] = value;
          if (result_keys.includes(key)) {
            delete result_keys[result_keys.indexOf(key)];
          }
        }
      }

      const intermediateResult = await placeholder.apply(subbedStr, result);
      subbedStr = subbedStr.replace(new RegExp(key, "g"), intermediateResult.result);
      for (const [key, value] of Object.entries(intermediateResult)) {
        if (result_keys.includes(key)) {
          result[key] = value;
        }
      }
    }
  }

  console.log(subbedStr);
  return subbedStr;
};

/**
 * A user-defined variable created via the {{set:...}} placeholder. These variables are stored in the extension's persistent local storage.
 */
export interface PersistentVariable {
  name: string;
  value: string;
  initialValue: string;
}

/**
 * Gets the current value of persistent variable from the extension's persistent local storage.
 * @param name The name of the variable to get.
 * @returns The value of the variable, or an empty string if the variable does not exist.
 */
export const getPersistentVariable = async (name: string): Promise<string> => {
  const vars: PersistentVariable[] = await getStorage(StorageKeys.PERSISTENT_VARIABLES);
  const variable = vars.find((variable) => variable.name == name);
  if (variable) {
    return variable.value;
  }
  return "";
};

/**
 * Sets the value of a persistent variable in the extension's persistent local storage. If the variable does not exist, it will be created. The most recently set variable will be always be placed at the end of the list.
 * @param name The name of the variable to set.
 * @param value The initial value of the variable.
 */
export const setPersistentVariable = async (name: string, value: string) => {
  const vars: PersistentVariable[] = await getStorage(StorageKeys.PERSISTENT_VARIABLES);
  const variable = vars.find((variable) => variable.name == name);
  if (variable) {
    vars.splice(vars.indexOf(variable), 1);
    variable.value = value;
    vars.push(variable);
  } else {
    vars.push({ name: name, value: value, initialValue: value });
  }
  await setStorage(StorageKeys.PERSISTENT_VARIABLES, vars);
};

/**
 * Resets the value of a persistent variable to its initial value. If the variable does not exist, nothing will happen.
 * @param name The name of the variable to reset.
 */
export const resetPersistentVariable = async (name: string): Promise<string> => {
  const vars: PersistentVariable[] = await getStorage(StorageKeys.PERSISTENT_VARIABLES);
  const variable = vars.find((variable) => variable.name == name);
  if (variable) {
    vars.splice(vars.indexOf(variable), 1);
    variable.value = variable.initialValue;
    vars.push(variable);
    await setStorage(StorageKeys.PERSISTENT_VARIABLES, vars);
    return variable.value;
  }
  return "";
};

/**
 * Deletes a persistent variable from the extension's persistent local storage. If the variable does not exist, nothing will happen.
 * @param name The name of the variable to delete.
 */
export const deletePersistentVariable = async (name: string) => {
  const vars: PersistentVariable[] = await getStorage(StorageKeys.PERSISTENT_VARIABLES);
  const variable = vars.find((variable) => variable.name == name);
  if (variable) {
    vars.splice(vars.indexOf(variable), 1);
    await setStorage(StorageKeys.PERSISTENT_VARIABLES, vars);
  }
};

/**
 * Wrapper for all placeholder functions.
 */
export const Placeholders = {
  allPlaceholders: placeholders,
  applyToString: applyToString,
  applyToStrings: applyToStrings,
  applyToObjectValueWithKey: applyToObjectValueWithKey,
  applyToObjectValuesWithKeys: applyToObjectValuesWithKeys,
  bulkApply: bulkApply,
};
