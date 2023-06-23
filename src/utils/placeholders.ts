/* eslint-disable @typescript-eslint/no-unused-vars */ // Disable since many placeholder functions have unused parameters that are kept for consistency.
import {
  LocalStorage,
  environment,
  getFrontmostApplication,
  getSelectedText,
  open,
  showHUD,
  showToast,
} from "@raycast/api";
import { Clipboard } from "@raycast/api";
import { runAppleScript } from "run-applescript";
import {
  SupportedBrowsers,
  getComputerName,
  getCurrentTrack,
  getCurrentURL,
  getInstalledApplications,
  getJSONResponse,
  getLastEmail,
  getLastNote,
  getMatchingYouTubeVideoID,
  getSafariBookmarks,
  getSafariTopSites,
  getTextOfWebpage,
  getTrackNames,
  getWeatherData,
  getYouTubeVideoTranscriptById,
  getYouTubeVideoTranscriptByURL,
} from "./context-utils";
import * as fs from "fs";
import * as os from "os";
import * as crypto from "crypto";
import * as vm from "vm";
import { execSync } from "child_process";
import { StorageKeys } from "./constants";
import { getStorage, setStorage } from "./storage-utils";
import { CalendarDuration, filterString, getUpcomingCalendarEvents, getUpcomingReminders } from "./calendar-utils";
import { addFileToSelection, getRunningApplications, searchNearbyLocations } from "./scripts";
import { getExtensions, getSelectedFiles } from "./file-utils";
import runModel from "./runModel";

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
     * The keys of the result object relevant to the placeholder. When placeholders are applied in bulk, this list is used to determine which keys to return as well as to make optimizations when determining which placeholders to apply. The first key in the list is the key for the placeholder's value.
     */
    result_keys?: string[];

    /**
     * The dependencies of the placeholder. When placeholders are applied in bulk, this list is used to determine the order in which placeholders are applied.
     */
    dependencies?: string[];

    /**
     * Whether or not the placeholder has a constant value during the placeholder substitution process. For example, users can use multiple URL placeholders, therefore it is not constant, while {{clipboardText}} is constant for the duration of the substitution process.
     */
    constant: boolean;

    /**
     * The function that applies the placeholder to a string. This function is used when the placeholder is used a {{js:...}} placeholder.
     * @param args
     * @returns
     */
    fn: (...args: never[]) => Promise<{ [key: string]: string; result: string }>;
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
    name: "reset",
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
    constant: false,
    fn: async (id: string) => await Placeholders.allPlaceholders["{{reset [a-zA-Z0-9_]+}}"].apply(`{{reset ${id}}}`),
  },

  /**
   * Directive to get the value of a persistent variable. If the variable does not exist, the placeholder will be replaced with an empty string.
   */
  "{{get [a-zA-Z0-9_]+}}": {
    name: "get",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const matches = str.match(/{{get ([a-zA-Z0-9_]+)}}/);
      if (matches) {
        const key = matches[1];
        return { result: (await getPersistentVariable(key)) || "" };
      }
      return { result: "" };
    },
    constant: false,
    fn: async (id: string) => await Placeholders.allPlaceholders["{{get [a-zA-Z0-9_]+}}"].apply(`{{get ${id}}}`),
  },

  /**
   * Directive to delete a persistent variable. If the variable does not exist, nothing will happen. The placeholder will always be replaced with an empty string.
   */
  "{{delete [a-zA-Z0-9_]+}}": {
    name: "delete",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const matches = str.match(/{{delete ([a-zA-Z0-9_]+)}}/);
      if (matches) {
        const key = matches[1];
        await deletePersistentVariable(key);
      }
      return { result: "" };
    },
    constant: false,
    fn: async (id: string) => await Placeholders.allPlaceholders["{{delete [a-zA-Z0-9_]+}}"].apply(`{{delete ${id}}}`),
  },

  "{{vars}}": {
    name: "vars",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const vars: PersistentVariable[] = await getStorage(StorageKeys.PERSISTENT_VARIABLES);
      if (Array.isArray(vars)) {
        const varNames = vars.map((v) => v.name);
        return { result: varNames.join(", "), vars: varNames.join(", ") };
      }
      return { result: "", vars: "" };
    },
    result_keys: ["vars"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{vars}}"].apply("{{vars}}"),
  },

  /**
   * Directive/placeholder to ask the user for input via a dialog window. The placeholder will be replaced with the user's input. If the user cancels the dialog, the placeholder will be replaced with an empty string.
   */
  "{{input}}": {
    name: "input",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      let input = context && "input" in context ? context["input"] : "";
      try {
        input = await getSelectedText();
      } catch (error) {
        input = "";
      }
      return { result: input, input: input };
    },
    result_keys: ["input"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{input}}"].apply("{{input}}"),
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
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{clipboardText}}"].apply("{{clipboardText}}"),
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
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{selectedText}}"].apply("{{selectedText}}"),
  },

  /**
   * Placeholder for the paths of the currently selected files in Finder as a comma-separated list. If no files are selected, this placeholder will not be replaced.
   */
  "{{selectedFiles}}": {
    name: "selectedFiles",
    aliases: ["{{selectedFile}}", "{{files}}"],
    rules: [
      async (str: string, context?: { [key: string]: string }) => {
        try {
          const data = await getSelectedFiles();
          return data.split("::").length > 0;
        } catch (e) {
          return false;
        }
      },
    ],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (!context || !("selectedFiles" in context)) return { result: "", selectedFiles: "" };
      try {
        const files = context && "selectedFiles" in context ? context["selectedFiles"] : await getSelectedFiles();
        return { result: files, selectedFiles: files };
      } catch (e) {
        return { result: "", selectedFiles: "" };
      }
    },
    result_keys: ["selectedFiles"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{selectedFiles}}"].apply("{{selectedFiles}}"),
  },

  "{{fileNames}}": {
    name: "fileNames",
    rules: [
      async (str: string, context?: { [key: string]: string }) => {
        try {
          const data = await getSelectedFiles();
          return data.split("::").length > 0;
        } catch (e) {
          return false;
        }
      },
    ],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const files = context && "selectedFiles" in context ? context["selectedFiles"] : await getSelectedFiles();
      const fileNames = files
        .split("::")
        .map((file) => file.split("/").pop())
        .join(", ");
      return { result: fileNames, fileNames: fileNames, selectedFiles: files };
    },
    result_keys: ["fileNames", "selectedFiles"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{fileNames}}"].apply("{{fileNames}}"),
  },

  /**
   * Placeholder for metadata of the currently selected files in Finder as a comma-separated list.
   */
  "{{metadata}}": {
    name: "metadata",
    rules: [
      async (str: string, context?: { [key: string]: string }) => {
        try {
          const data = await getSelectedFiles();
          return data.split("::").length > 0;
        } catch (e) {
          return false;
        }
      },
    ],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const files = (context && "selectedFiles" in context ? context["selectedFiles"] : await getSelectedFiles()).split(
        ", "
      );
      const metadata =
        context && "metadata" in context
          ? context["metadata"]
          : files
              .map((file) => {
                const fileMetadata = Object.entries(fs.lstatSync(file))
                  .map(([key, value]) => `${key}:${value}`)
                  .join("\n");
                return `${file}:\n${fileMetadata}`;
              })
              .join("\n\n");
      return { result: metadata, metadata: metadata, selectedFiles: files.join(", ") };
    },
    result_keys: ["metadata", "selectedFiles"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{metadata}}"].apply("{{metadata}}"),
  },

  "{{imageText}}": {
    name: "imageText",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const imageText = context && "imageText" in context ? context["imageText"] : "";
      return { result: imageText, imageText: imageText };
    },
    result_keys: ["imageText"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{imageText}}"].apply("{{imageText}}"),
  },

  "{{imageFaces}}": {
    name: "imageFaces",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const imageFaces = context && "imageFaces" in context ? context["imageFaces"] : "";
      return { result: imageFaces, imageFaces: imageFaces };
    },
    result_keys: ["imageFaces"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{imageFaces}}"].apply("{{imageFaces}}"),
  },

  "{{imageAnimals}}": {
    name: "imageAnimals",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const imageAnimals = context && "imageAnimals" in context ? context["imageAnimals"] : "";
      return { result: imageAnimals, imageAnimals: imageAnimals };
    },
    result_keys: ["imageAnimals"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{imageAnimals}}"].apply("{{imageAnimals}}"),
  },

  "{{imageSubjects}}": {
    name: "imageSubjects",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const imageSubjects = context && "imageSubjects" in context ? context["imageSubjects"] : "";
      return { result: imageSubjects, imageSubjects: imageSubjects };
    },
    result_keys: ["imageSubjects"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{imageSubjects}}"].apply("{{imageSubjects}}"),
  },

  "{{imageSaliency}}": {
    name: "imageSaliency",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const imageSaliency = context && "imageSaliency" in context ? context["imageSaliency"] : "";
      return { result: imageSaliency, imageSaliency: imageSaliency };
    },
    result_keys: ["imageSaliency"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{imageSaliency}}"].apply("{{imageSaliency}}"),
  },

  "{{imageBarcodes}}": {
    name: "imageBarcodes",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const imageBarcodes = context && "imageBarcodes" in context ? context["imageBarcodes"] : "";
      return { result: imageBarcodes, imageBarcodes: imageBarcodes };
    },
    result_keys: ["imageBarcodes"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{imageBarcodes}}"].apply("{{imageBarcodes}}"),
  },

  "{{imageRectangles}}": {
    name: "imageRectangles",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const imageRectangles = context && "imageRectangles" in context ? context["imageRectangles"] : "";
      return { result: imageRectangles, imageRectangles: imageRectangles };
    },
    result_keys: ["imageRectangles"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{imageRectangles}}"].apply("{{imageRectangles}}"),
  },

  "{{pdfRawText}}": {
    name: "pdfRawText",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const pdfRawText = context && "pdfRawText" in context ? context["pdfRawText"] : "";
      return { result: pdfRawText, pdfRawText: pdfRawText };
    },
    result_keys: ["pdfRawText"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{pdfRawText}}"].apply("{{pdfRawText}}"),
  },

  "{{pdfOCRText}}": {
    name: "pdfOCRText",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const pdfOCRText = context && "pdfOCRText" in context ? context["pdfOCRText"] : "";
      return { result: pdfOCRText, pdfOCRText: pdfOCRText };
    },
    result_keys: ["pdfOCRText"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{pdfOCRText}}"].apply("{{pdfOCRText}}"),
  },

  /**
   * Placeholder for the contents of the currently selected files in Finder as a newline-separated list. If no files are selected, this placeholder will not be replaced.
   */
  "{{selectedFileContents}}": {
    name: "selectedFileContents",
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
          const data = await getSelectedFiles();
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
        const files =
          context && "selectedFiles" in context
            ? context["selectedFiles"].split(", ")
            : (await getSelectedFiles()).split(", ");
        const fileContents = files.map((file) => fs.readFileSync(file)).join("\n\n");
        return { result: fileContents, selectedFileContents: fileContents, selectedFiles: files.join(", ") };
      } catch (e) {
        return { result: "", selectedFileContents: "", selectedFiles: "" };
      }
    },
    result_keys: ["selectedFileContents"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{selectedFileContents}}"].apply("{{selectedFileContents}}"),
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
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{currentAppName}}"].apply("{{currentAppName}}"),
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
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{currentAppPath}}"].apply("{{currentAppPath}}"),
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
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{currentDirectory}}"].apply("{{currentDirectory}}"),
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
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{currentURL}}"].apply("{{currentURL}}"),
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
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{currentTabText}}"].apply("{{currentTabText}}"),
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
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{user}}"].apply("{{user}}"),
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
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{homedir}}"].apply("{{homedir}}"),
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
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{hostname}}"].apply("{{hostname}}"),
  },

  "{{computerName}}": {
    name: "computerName",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "computerName" in context) {
        return { result: context["computerName"], computerName: context["computerName"] };
      }

      const name = await getComputerName();
      return { result: name, computerName: name };
    },
    result_keys: ["computerName"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{computerName}}"].apply("{{computerName}}"),
  },

  /**
   * Placeholder for the list of names of all Siri Shortcuts on the current machine. The list is comma-separated.
   */
  "{{shortcuts}}": {
    name: "shortcuts",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const shortcuts =
        context && "shortcuts" in context
          ? context["shortcuts"]
          : await runAppleScript(`tell application "Shortcuts Events" to return name of every shortcut`);
      return { result: shortcuts, shortcuts: shortcuts };
    },
    result_keys: ["shortcuts"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{shortcuts}}"].apply("{{shortcuts}}"),
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
      const dateStr =
        context && "date" in context
          ? context["date"]
          : await runAppleScript(`use framework "Foundation"
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
    constant: false,
    fn: async (format: string) =>
      await Placeholders.allPlaceholders["{{date( format=(\"|').*?(\"|'))?}}"].apply(
        `{{date${format?.length ? ` format="${format}"` : ""}}`
      ),
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
    constant: false,
    fn: async (locale: string) =>
      await Placeholders.allPlaceholders["{{day( locale=(\"|').*?(\"|'))?}}"].apply(
        `{{day${locale?.length ? ` locale="${locale}"` : ""}}}`
      ),
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
      const time =
        context && "time" in context
          ? context["time"]
          : await runAppleScript(`use framework "Foundation"
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
    constant: false,
    fn: async (format?: string) =>
      await Placeholders.allPlaceholders["{{time( format=(\"|').*?(\"|'))?}}"].apply(
        `{{time${format?.length ? ` format="${format}"` : ""}}}`
      ),
  },

  /**
   * Placeholder for the default language for the current user. Barring any issues, this should always be replaced.
   */
  "{{systemLanguage}}": {
    name: "systemLanguage",
    aliases: ["{{language}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const lang =
        context && "lang" in context
          ? context["lang"]
          : await runAppleScript(`use framework "Foundation"
                set locale to current application's NSLocale's autoupdatingCurrentLocale()
                set langCode to locale's languageCode()
                return (locale's localizedStringForLanguageCode:langCode) as text`);
      return { result: lang, systemLanguage: lang };
    },
    result_keys: ["systemLanguage"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{systemLanguage}}"].apply("{{systemLanguage}}"),
  },

  /**
   * Placeholder for the comma-separated list of track names in Music.app.
   */
  "{{musicTracks}}": {
    name: "musicTracks",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "musicTracks" in context) {
        return { result: context["musicTracks"], musicTracks: context["musicTracks"] };
      }

      const tracks = filterString(await getTrackNames());
      return { result: tracks, musicTracks: tracks };
    },
    result_keys: ["musicTracks"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{musicTracks}}"].apply("{{musicTracks}}"),
  },

  /**
   * Placeholder for the name of the currently playing track in Music.app.
   */
  "{{currentTrack}}": {
    name: "currentTrack",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "currentTrack" in context) {
        return { result: context["currentTrack"], currentTrack: context["currentTrack"] };
      }

      const track = filterString(await getCurrentTrack());
      return { result: track, currentTrack: track };
    },
    result_keys: ["currentTrack"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{currentTrack}}"].apply("{{currentTrack}}"),
  },

  /**
   * Placeholder for the HTML text of the most recently edited note in Notes.app.
   */
  "{{lastNote}}": {
    name: "lastNote",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "lastNote" in context) {
        return { result: context["lastNote"], lastNote: context["lastNote"] };
      }

      const note = filterString(await getLastNote());
      return { result: note, lastNote: note };
    },
    result_keys: ["lastNote"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{lastNote}}"].apply("{{lastNote}}"),
  },

  /**
   * Placeholder for the text of the most recently received email in Mail.app.
   */
  "{{lastEmail}}": {
    name: "lastEmail",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "lastEmail" in context) {
        return { result: context["lastEmail"], lastEmail: context["lastEmail"] };
      }

      const email = filterString(await getLastEmail());
      return { result: email, lastEmail: email };
    },
    result_keys: ["lastEmail"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{lastEmail}}"].apply("{{lastEmail}}"),
  },

  /**
   * Placeholder for the comma-separated list of application names installed on the system.
   */
  "{{installedApps}}": {
    name: "installedApps",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "installedApps" in context) {
        return { result: context["installedApps"], installedApps: context["installedApps"] };
      }

      const apps = filterString(await getInstalledApplications());
      return { result: apps, installedApps: apps };
    },
    result_keys: ["installedApps"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{installedApps}}"].apply("{{installedApps}}"),
  },

  /**
   * Placeholder for the comma-separated list of names of all installed PromptLab commands.
   */
  "{{commands}}": {
    name: "commands",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "commands" in context) {
        return { result: context["commands"], commands: context["commands"] };
      }

      const storedItems = await LocalStorage.allItems();
      const commands = filterString(Object.keys(storedItems).join(", "));
      return { result: commands, commands: commands };
    },
    result_keys: ["commands"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{commands}}"].apply("{{commands}}"),
  },

  /**
   * Placeholder for the comma-separated list of titles and URLs of the most frequently visited websites in Safari, obtained via plist.
   */
  "{{safariTopSites}}": {
    name: "safariTopSites",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "safariTopSites" in context) {
        return { result: context["safariTopSites"], safariTopSites: context["safariTopSites"] };
      }

      const sites = filterString(await getSafariTopSites());
      return { result: sites, safariTopSites: sites };
    },
    result_keys: ["safariTopSites"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{safariTopSites}}"].apply("{{safariTopSites}}"),
  },

  /**
   * Placeholder for the comma-separated list of titles and URLs of all bookmarks in Safari, obtained via plist.
   */
  "{{safariBookmarks}}": {
    name: "safariBookmarks",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "safariBookmarks" in context) {
        return { result: context["safariBookmarks"], safariBookmarks: context["safariBookmarks"] };
      }

      const sites = filterString(await getSafariBookmarks());
      return { result: sites, safariBookmarks: sites };
    },
    result_keys: ["safariBookmarks"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{safariBookmarks}}"].apply("{{safariBookmarks}}"),
  },

  /**
   * Placeholder for a comma-separated list of the names of all running applications that are visible to the user.
   */
  "{{runningApplications}}": {
    name: "runningApplications",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "runningApplications" in context) {
        return { result: context["runningApplications"], runningApplications: context["runningApplications"] };
      }

      const apps = filterString(await getRunningApplications());
      return { result: apps, runningApplications: apps };
    },
    result_keys: ["runningApplications"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{runningApplications}}"].apply("{{runningApplications}}"),
  },

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
    constant: false,
    fn: async () => await Placeholders.allPlaceholders["{{uuid}}"].apply("{{uuid}}"),
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
    constant: false,
    fn: async () => await Placeholders.allPlaceholders["{{usedUUIDs}}"].apply("{{usedUUIDs}}"),
  },

  /**
   * Placeholder for the user's current location in the format "city, region, country".
   * The location is determined by the user's IP address.
   */
  "{{location}}": {
    name: "location",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "location" in context) {
        return { result: context["location"], location: context["location"] };
      }

      const jsonObj = getJSONResponse("https://get.geojs.io/v1/ip/geo.json");
      const city = jsonObj["city"];
      const region = jsonObj["region"];
      const country = jsonObj["country"];
      const location = `${city}, ${region}, ${country}`;
      return { result: location, location: location };
    },
    result_keys: ["location"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{location}}"].apply("{{location}}"),
  },

  /**
   * Placeholder for 24-hour weather forecast data at the user's current location, in JSON format.
   */
  "{{todayWeather}}": {
    name: "todayWeather",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "todayWeather" in context) {
        return { result: context["todayWeather"], todayWeather: context["todayWeather"] };
      }

      const weather = JSON.stringify(getWeatherData(1));
      return { result: weather, todayWeather: weather };
    },
    result_keys: ["todayWeather"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{todayWeather}}"].apply("{{todayWeather}}"),
  },

  /**
   * Placeholder for 7-day weather forecast data at the user's current location, in JSON format.
   */
  "{{weekWeather}}": {
    name: "weekWeather",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "weekWeather" in context) {
        return { result: context["weekWeather"], weekWeather: context["weekWeather"] };
      }

      const weather = JSON.stringify(getWeatherData(7));
      return { result: weather, weekWeather: weather };
    },
    result_keys: ["weekWeather"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{weekWeather}}"].apply("{{weekWeather}}"),
  },

  /**
   * Placeholder for a comma-separated list of the name, start time, and end time of all calendar events that are scheduled over the next 24 hours.
   */
  "{{todayEvents}}": {
    name: "todayEvents",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "todayEvents" in context) {
        return { result: context["todayEvents"], todayEvents: context["todayEvents"] };
      }

      const events = filterString(await getUpcomingCalendarEvents(CalendarDuration.DAY));
      return { result: events, todayEvents: events };
    },
    result_keys: ["todayEvents"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{todayEvents}}"].apply("{{todayEvents}}"),
  },

  /**
   * Placeholder for a comma-separated list of the name, start time, and end time of all calendar events that are scheduled over the next 7 days.
   */
  "{{weekEvents}}": {
    name: "weekEvents",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "weekEvents" in context) {
        return { result: context["weekEvents"], weekEvents: context["weekEvents"] };
      }

      const events = filterString(await getUpcomingCalendarEvents(CalendarDuration.WEEK));
      return { result: events, weekEvents: events };
    },
    result_keys: ["weekEvents"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{weekEvents}}"].apply("{{weekEvents}}"),
  },

  /**
   * Placeholder for a comma-separated list of the name, start time, and end time of all calendar events that are scheduled over the next 30 days.
   */
  "{{monthEvents}}": {
    name: "monthEvents",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "monthEvents" in context) {
        return { result: context["monthEvents"], monthEvents: context["monthEvents"] };
      }

      const events = filterString(await getUpcomingCalendarEvents(CalendarDuration.MONTH));
      return { result: events, monthEvents: events };
    },
    result_keys: ["monthEvents"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{monthEvents}}"].apply("{{monthEvents}}"),
  },

  /**
   * Placeholder for a comma-separated list of the name, start time, and end time of all calendar events that are scheduled over the next 365 days.
   */
  "{{yearEvents}}": {
    name: "yearEvents",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "yearEvents" in context) {
        return { result: context["yearEvents"], yearEvents: context["yearEvents"] };
      }

      const events = filterString(await getUpcomingCalendarEvents(CalendarDuration.YEAR));
      return { result: events, yearEvents: events };
    },
    result_keys: ["yearEvents"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{yearEvents}}"].apply("{{yearEvents}}"),
  },

  /**
   * Placeholder for a comma-separated list of the name and due date/time of all calendar events that are scheduled over the next 24 hours.
   */
  "{{todayReminders}}": {
    name: "todayReminders",
    aliases: ["{{todayTasks}}", "{{todayTodos}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "todayReminders" in context) {
        return { result: context["todayReminders"], todayReminders: context["todayReminders"] };
      }

      const reminders = filterString(await getUpcomingReminders(CalendarDuration.DAY));
      return { result: reminders, todayReminders: reminders };
    },
    result_keys: ["todayReminders"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{todayReminders}}"].apply("{{todayReminders}}"),
  },

  /**
   * Placeholder for a comma-separated list of the name and due date/time of all calendar events that are scheduled over the next 7 days.
   */
  "{{weekReminders}}": {
    name: "weekReminders",
    aliases: ["{{weekTasks}}", "{{weekTodos}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "weekReminders" in context) {
        return { result: context["weekReminders"], weekReminders: context["weekReminders"] };
      }

      const reminders = filterString(await getUpcomingReminders(CalendarDuration.WEEK));
      return { result: reminders, weekReminders: reminders };
    },
    result_keys: ["weekReminders"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{weekReminders}}"].apply("{{weekReminders}}"),
  },

  /**
   * Placeholder for a comma-separated list of the name and due date/time of all calendar events that are scheduled over the next 30 days.
   */
  "{{monthReminders}}": {
    name: "monthReminders",
    aliases: ["{{monthTasks}}", "{{monthTodos}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "monthReminders" in context) {
        return { result: context["monthReminders"], monthReminders: context["monthReminders"] };
      }

      const reminders = filterString(await getUpcomingReminders(CalendarDuration.MONTH));
      return { result: reminders, monthReminders: reminders };
    },
    result_keys: ["monthReminders"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{monthReminders}}"].apply("{{monthReminders}}"),
  },

  /**
   * Placeholder for a comma-separated list of the name and due date/time of all calendar events that are scheduled over the next 365 days.
   */
  "{{yearReminders}}": {
    name: "yearReminders",
    aliases: ["{{yearTasks}}", "{{yearTodos}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "yearReminders" in context) {
        return { result: context["yearReminders"], yearReminders: context["yearReminders"] };
      }

      const reminders = filterString(await getUpcomingReminders(CalendarDuration.YEAR));
      return { result: reminders, yearReminders: reminders };
    },
    result_keys: ["yearReminders"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{yearReminders}}"].apply("{{yearReminders}}"),
  },

  /**
   * Placeholder for the name of the last command executed by the user.
   */
  "{{previousCommand}}": {
    name: "previousCommand",
    aliases: ["{{lastCommand}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "previousCommand" in context) {
        return { result: context["previousCommand"], previousCommand: context["previousCommand"] };
      }
      return { result: "", previousCommand: "" };
    },
    result_keys: ["previousCommand"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{previousCommand}}"].apply("{{previousCommand}}"),
  },

  /**
   * Placeholder for the fully substituted text of the AI's previous response.
   */
  "{{previousPrompt}}": {
    name: "previousPrompt",
    aliases: ["{{lastPrompt}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "previousPrompt" in context) {
        return { result: context["previousPrompt"], previousPrompt: context["previousPrompt"] };
      }
      return { result: "", previousPrompt: "" };
    },
    result_keys: ["previousPrompt"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{previousPrompt}}"].apply("{{previousPrompt}}"),
  },

  /**
   * Placeholder for the text of the AI's previous response.
   */
  "{{previousResponse}}": {
    name: "previousResponse",
    aliases: ["{{lastResponse}}"],
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      if (context && "previousResponse" in context) {
        return { result: context["previousResponse"], previousResponse: context["previousResponse"] };
      }
      return { result: "", previousResponse: "" };
    },
    result_keys: ["previousResponse"],
    constant: true,
    fn: async () => await Placeholders.allPlaceholders["{{previousResponse}}"].apply("{{previousResponse}}"),
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
        return { result: filterString(urlText), url: filterString(urlText) };
      } catch (e) {
        return { result: "", url: "" };
      }
    },
    constant: false,
    fn: async (url: string) => await Placeholders.allPlaceholders["{(url|URL):.*?}}"].apply(`{{url:${url}}}`),
  },

  /**
   * Placeholder for the raw text of a file at the given path. The path can be absolute or relative to the user's home directory (e.g. `~/Desktop/file.txt`). The file must be readable as UTF-8 text, or the placeholder will be replaced with an empty string.
   */
  "{{file:(.|^[\\s\\n\\r])*?}}": {
    name: "file",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const target = str.match(/(?<=(file:))[\s\S]*?(?=}})/)?.[0];
      if (!target) return { result: "", file: "" };

      const filePath = target.startsWith("~") ? target.replace("~", os.homedir()) : target;
      if (filePath == "") return { result: "", file: "" };

      if (!filePath.startsWith("/")) return { result: "", file: "" };

      try {
        const text = fs.readFileSync(filePath, "utf-8");
        return { result: filterString(text), file: filterString(text) };
      } catch (e) {
        return { result: "", file: "" };
      }
    },
    constant: false,
    fn: async (path: string) =>
      await Placeholders.allPlaceholders["{{file:(.|^[\\s\\n\\r])*?}}"].apply(`{{file:${path}}}`),
  },

  /**
   * Directive to increment a persistent counter variable by 1. Returns the new value of the counter.
   */
  "{{increment:[\\s\\S]*?}}": {
    name: "increment",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const name = str.match(/(?<=(increment:))[\s\S]*?(?=}})/)?.[0];
      const identifier = `id-${name}`;
      const value = parseInt((await LocalStorage.getItem(identifier)) || "0") + 1;
      await LocalStorage.setItem(identifier, value.toString());
      return { result: value.toString() };
    },
    constant: false,
    fn: async (id: string) =>
      await Placeholders.allPlaceholders["{{increment:[\\s\\S]*?}}"].apply(`{{increment:${id}}}`),
  },

  /**
   * Directive to decrement a persistent counter variable by 1. Returns the new value of the counter.
   */
  "{{decrement:[\\s\\S]*?}}": {
    name: "decrement",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const name = str.match(/(?<=(decrement:))[\s\S]*?(?=}})/)?.[0];
      const identifier = `id-${name}`;
      const value = parseInt((await LocalStorage.getItem(identifier)) || "0") + 1;
      await LocalStorage.setItem(identifier, value.toString());
      return { result: value.toString() };
    },
    constant: false,
    fn: async (id: string) =>
      await Placeholders.allPlaceholders["{{decrement:[\\s\\S]*?}}"].apply(`{{decrement:${id}}}`),
  },

  /**
   * Placeholder for a comma-separated list of nearby locations based on the given search query.
   */
  "{{nearbyLocations:([\\s\\S]*)}}": {
    name: "nearbyLocations",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const query = str.match(/(?<=(nearbyLocations:))[\s\S]*?(?=}})/)?.[0];
      const nearbyLocations = await searchNearbyLocations(query || "");
      return { result: filterString(nearbyLocations) };
    },
    constant: false,
    fn: async (query?: string) =>
      await Placeholders.allPlaceholders["{{nearbyLocations:([\\s\\S]*)}}"].apply(`{{nearbyLocations:${query || ""}}}`),
  },

  /**
   * Directive to copy the provided text to the clipboard. The placeholder will always be replaced with an empty string.
   */
  "{{copy:[\\s\\S]*?}}": {
    name: "copy",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const text = str.match(/(?<=(copy:))[\s\S]*?(?=}})/)?.[0];
      if (!text) return { result: "" };
      await Clipboard.copy(text);
      if (environment.commandName == "index") {
        await showHUD("Copied to Clipboard");
      } else {
        await showToast({ title: "Copied to Clipboard" });
      }
      return { result: "" };
    },
    constant: false,
    fn: async (text: string) => await Placeholders.allPlaceholders["{{copy:[\\s\\S]*?}}"].apply(`{{copy:${text}}}`),
  },

  /**
   * Directive to paste the provided text in the frontmost application. The placeholder will always be replaced with an empty string.
   */
  "{{paste:[\\s\\S]*?}}": {
    name: "paste",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const text = str.match(/(?<=(paste:))[\s\S]*?(?=}})/)?.[0];
      if (!text) return { result: "" };
      await Clipboard.paste(text);
      await showHUD("Pasted Into Frontmost App");
      return { result: "" };
    },
    constant: false,
    fn: async (text: string) => await Placeholders.allPlaceholders["{{paste:[\\s\\S]*?}}"].apply(`{{paste:${text}}}`),
  },

  /**
   * Directive to select files. The placeholder will always be replaced with an empty string.
   */
  "{{selectFile:[\\s\\S]*?}}": {
    name: "selectFile",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const file = str.match(/(?<=(selectFiles:))[\s\S]*?(?=}})/)?.[0];
      if (!file) return { result: "" };
      await addFileToSelection(file);
      return { result: "" };
    },
    constant: false,
    fn: async (path: string) =>
      await Placeholders.allPlaceholders["{{selectFile:[\\s\\S]*?}}"].apply(`{{selectFile:${path}}}`),
  },

  /**
   * Directive/placeholder to execute a Siri Shortcut by name, optionally supplying input, and insert the result. If the result is null, the placeholder will be replaced with an empty string.
   */
  "{{shortcut:([\\s\\S]+?)(:[\\s\\S]*?)?}}": {
    name: "shortcut",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const matches = str.match(/{{shortcut:([\s\S]+?)?(:[\s\S]*?)?}}/);
      if (matches) {
        const shortcutName = matches[1];
        const input = matches[2] ? matches[2].slice(1) : "";
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
    constant: false,
    fn: async (shortcut: string, input?: string) =>
      await Placeholders.allPlaceholders["{{shortcut:([\\s\\S]+?)(:[\\s\\S]*?)?}}"].apply(
        `{{shortcut:${shortcut}${input?.length ? `:${input}` : ""}}}`
      ),
  },

  /**
   * Replaces prompt placeholders with the response to the prompt.
   */
  "{{prompt:([\\s\\S])*?}}": {
    name: "prompt",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const prompt = str.match(/(?<=(prompt:))[\s\S]*?(?=}})/)?.[0] || "";
      if (prompt.trim().length == 0) return { result: "" };
      const response = await runModel(prompt, prompt, "");
      return { result: response || "" };
    },
    constant: false,
    fn: async (text: string) =>
      await Placeholders.allPlaceholders["{{prompt:([\\s\\S])*?}}"].apply(`{{prompt:${text}}}`),
  },

  /**
   * Directive to run a Raycast command. The placeholder will always be replaced with an empty string. Commands are specified in the format {{command:commandName:extensionName}}.
   */
  "{{command:([^:}]*[\\s]*)*?(:([^:}]*[\\s]*)*?)?(:([^:}]*[\\s]*)*?)?}}": {
    name: "command",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
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
      await Placeholders.allPlaceholders["{{command:([^:}]*[\\s]*)*?(:([^:}]*[\\s]*)*?)?(:([^:}]*[\\s]*)*?)?}}"].apply(
        `{{command:${command}${extension?.length ? `:${extension}${input?.length ? `:${input}` : ``}` : ``}}`
      ),
  },

  /**
   * Replaces YouTube placeholders with the transcript of the corresponding YouTube video.
   */
  "{{(youtube|yt):([\\s\\S]*?)}}": {
    name: "youtube",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const specifier = str.match(/(?<=(youtube|yt):)[\s\S]*?(?=}})/)?.[0] || "";
      if (specifier.trim().length == 0) {
        return { result: "No video specified" };
      }

      const transcriptText = specifier.startsWith("http")
        ? await getYouTubeVideoTranscriptByURL(specifier)
        : await getYouTubeVideoTranscriptById(getMatchingYouTubeVideoID(specifier));
      return { result: filterString(transcriptText) };
    },
    constant: false,
    fn: async (idOrURL: string) =>
      await Placeholders.allPlaceholders["{{(youtube|yt):([\\s\\S]*?)}}"].apply(`{{youtube:${idOrURL}}}`),
  },

  /**
   * Placeholder for output of an AppleScript script. If the script fails, this placeholder will be replaced with an empty string. No sanitization is done in the script input; the expectation is that users will only use this placeholder with trusted scripts.
   */
  "{{(as|AS):(.|[ \\n\\r\\s])*?}}": {
    name: "as",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const script = str.match(/(?<=(as|AS):)(.|[ \n\r\s])*?(?=}})/)?.[0];
        if (!script) return { result: "", applescript: "" };
        const res = await runAppleScript(`try
          ${script}
          end try`);
        return { result: res, applescript: res };
      } catch (e) {
        return { result: "", applescript: "" };
      }
    },
    constant: false,
    fn: async (script: string) =>
      await Placeholders.allPlaceholders["{{(as|AS):(.|[ \\n\\r\\s])*?}}"].apply(`{{as:${script}}}`),
  },

  /**
   * Placeholder for output of a JavaScript for Automation script. If the script fails, this placeholder will be replaced with an empty string. No sanitization is done in the script input; the expectation is that users will only use this placeholder with trusted scripts.
   */
  "{{(jxa|JXA):(.|[ \\n\\r\\s])*?}}": {
    name: "jxa",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const script = str.match(/(?<=(jxa|JXA):)(.|[ \n\r\s])*?(?=}})/)?.[0];
        if (!script) return { result: "", jxa: "" };
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
    constant: false,
    fn: async (script: string) =>
      await Placeholders.allPlaceholders["{{(jxa|JXA):(.|[ \\n\\r\\s])*?}}"].apply(`{{jxa:${script}}}`),
  },

  /**
   * Placeholder for output of a shell script. If the script fails, this placeholder will be replaced with an empty string. No sanitization is done on the script input; the expectation is that users will only use this placeholder with trusted scripts.
   */
  "{{shell( .*)?:(.|[ \\n\\r\\s])*?}}": {
    name: "shell",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const script = str.match(/(?<=shell( .*)?:)(.|[ \n\r\s])*?(?=}})/)?.[0];
        if (!script) return { result: "", shell: "" };

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
    constant: false,
    fn: async (script: string) =>
      await Placeholders.allPlaceholders["{{shell( .*)?:(.|[ \\n\\r\\s])*?}}"].apply(`{{shell:${script}}}`),
  },

  /**
   * Directive to set the value of a persistent variable. If the variable does not exist, it will be created. The placeholder will always be replaced with an empty string.
   */
  "{{set [a-zA-Z0-9_]+:[\\s\\S]*?}}": {
    name: "setPersistentVariable",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      const matches = str.match(/{{set ([a-zA-Z0-9_]+):([\s\S]*?)}}/);
      if (matches) {
        const key = matches[1];
        const value = matches[2];
        await setPersistentVariable(key, value);
      }
      return { result: "" };
    },
    constant: false,
    fn: async (id: string, value: string) =>
      await Placeholders.allPlaceholders["{{set [a-zA-Z0-9_]+:[\\s\\S]*?}}"].apply(`{{set ${id}:${value}}}`),
  },

  /**
   * Placeholder for output of a JavaScript script. If the script fails, this placeholder will be replaced with an empty string. The script is run in a sandboxed environment.
   */
  "{{(js|JS):(.|[ \\n\\r\\s])*?}}": {
    name: "js",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      try {
        const script = str.match(/(?<=(js|JS):)(.|[ \n\r\s])*?(?=}})/)?.[0];
        if (!script) return { result: "", js: "" };
        const sandbox = Object.values(Placeholders.allPlaceholders).reduce((acc, placeholder) => {
          acc[placeholder.name] = placeholder.fn;
          return acc;
        }, {} as { [key: string]: (...args: never[]) => Promise<{ [key: string]: string; result: string }> });
        const res = await vm.runInNewContext(script, sandbox, { timeout: 1000, displayErrors: true });
        return { result: res, js: script };
      } catch (e) {
        return { result: "", js: "" };
      }
    },
    constant: false,
    fn: async (script: string) =>
      await Placeholders.allPlaceholders["{{(js|JS):(.|[ \\n\\r\\s])*?}}"].apply(`{{js:${script}}}`),
  },

  /**
   * Directive to ignore all content within the directive. Allows placeholders and directives to run without influencing the output.
   */
  "{{(ignore|IGNORE):[^}]*?}}": {
    name: "ignore",
    rules: [],
    apply: async (str: string, context?: { [key: string]: string }) => {
      return { result: "" };
    },
    constant: false,
    fn: async (content: string) =>
      await Placeholders.allPlaceholders["{{(ignore|IGNORE):[^}]*?}}"].apply(`{{ignore:${content}}}`),
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

/**
 * Applies placeholders to a string by memoizing the results of each placeholder.
 * @param str The string to apply placeholders to.
 * @returns The string with placeholders substituted.
 */
const bulkApply = async (str: string, context?: { [key: string]: string }): Promise<string> => {
  let subbedStr = str;
  const result = { ...(context || {}) };

  // Apply any substitutions that are already in the context
  for (const contextKey in context) {
    const keyHolder = Object.entries(placeholders).find(([key, placeholder]) => placeholder.name == contextKey);
    if (keyHolder && !(contextKey == "input" && context[contextKey] == "")) {
      subbedStr = subbedStr.replace(new RegExp(keyHolder[0], "g"), context[contextKey]);
    }
  }

  for (const [key, placeholder] of Object.entries(placeholders)) {
    // Skip if the placeholder isn't in the string
    const matchingAliases = (placeholder.aliases || []).filter((alias) => subbedStr.match(new RegExp(alias, "g")));
    if (!subbedStr.match(new RegExp(key, "g")) && !matchingAliases.length) continue;

    if (subbedStr.match(new RegExp(key, "g"))) {
      matchingAliases.push(key);
    }

    for (const alias of matchingAliases) {
      // Skip if all result keys are already in the result (i.e. the placeholder has already been applied to the string as a dependency of another placeholder)
      const result_keys = placeholder.result_keys?.filter(
        (key) => !(key in result) || (result[key] == "" && key == "input")
      );
      if (result_keys == undefined || result_keys.length > 0) {
        for (const dependencyName of placeholder.dependencies || []) {
          // Get the placeholder that matches the dependency name
          const dependency = Object.entries(placeholders).find((placeholder) => placeholder[1].name == dependencyName);
          if (!dependency) continue;

          // Apply the dependency placeholder and store the result
          while (subbedStr.match(new RegExp(dependency[0], "g")) != undefined) {
            const intermediateResult = await dependency[1].apply(subbedStr, result);

            if (dependency[1].constant) {
              subbedStr = subbedStr.replace(new RegExp(dependency[0], "g"), intermediateResult.result);
            } else {
              subbedStr = subbedStr.replace(new RegExp(dependency[0]), intermediateResult.result);
            }

            for (const [key, value] of Object.entries(intermediateResult)) {
              result[key] = value;
              if (result_keys?.includes(key)) {
                result_keys.splice(result_keys.indexOf(key), 1);
              }
            }

            // Don't waste time applying other occurrences if the result is constant
            if (dependency[1].constant) {
              break;
            }
          }
        }

        // Apply the placeholder and store the result
        while (subbedStr.match(new RegExp(alias, "g")) != undefined) {
          const intermediateResult = await placeholder.apply(subbedStr, result);

          if (placeholder.constant) {
            subbedStr = subbedStr.replace(new RegExp(alias, "g"), intermediateResult.result);
          } else {
            subbedStr = subbedStr.replace(new RegExp(alias), intermediateResult.result);
          }

          for (const [key, value] of Object.entries(intermediateResult)) {
            result[key] = value;
            if (result_keys?.includes(key)) {
              result_keys.splice(result_keys.indexOf(key), 1);
            }
          }

          // Don't waste time applying other occurrences if the result is constant
          if (placeholder.constant) {
            break;
          }
        }
      }
    }
  }
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
