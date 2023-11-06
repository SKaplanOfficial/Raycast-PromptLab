import { LocalStorage, environment, getPreferenceValues, showToast } from "@raycast/api";
import * as fs from "fs";
import { defaultCommands } from "../data/default-commands";
import {
  AudioData,
  CommandOptions,
  CustomPlaceholder,
  Extension,
  ExtensionCommand,
  ExtensionPreferences,
  ImageData,
} from "./types";
import { defaultModels } from "../data/default-models";
import { randomUUID } from "crypto";
import path from "path";
import { ADVANCED_SETTINGS_FILENAME, CUSTOM_PLACEHOLDERS_FILENAME } from "./constants";
import { defaultCustomPlaceholders } from "../data/default-custom-placeholders";
import { ScriptRunner } from "./scripts";
import exifr from "exifr";
import { filterString } from "./context-utils";
import { defaultAdvancedSettings } from "../data/default-advanced-settings";
import { exec } from "child_process";
import * as os from "os";
import { Placeholder } from "./placeholders/types";

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

    // Load default commands
    for (const [key, value] of Object.entries(defaultCommands)) {
      await LocalStorage.setItem(key, JSON.stringify(value));
    }

    // Load default models
    for (const [key, value] of Object.entries(defaultModels)) {
      await LocalStorage.setItem(key, JSON.stringify({ ...value, id: randomUUID() }));
    }

    // Set up data files
    const customPlaceholdersPath = path.join(environment.supportPath, CUSTOM_PLACEHOLDERS_FILENAME);
    if (!fs.existsSync(customPlaceholdersPath)) {
      await fs.promises.writeFile(customPlaceholdersPath, JSON.stringify(defaultCustomPlaceholders, null, 2));
    }

    const advancedSettingsPath = path.join(environment.supportPath, ADVANCED_SETTINGS_FILENAME);
    if (!fs.existsSync(advancedSettingsPath)) {
      await fs.promises.writeFile(advancedSettingsPath, JSON.stringify(defaultAdvancedSettings, null, 2));
    }

    await LocalStorage.setItem("--defaults-installed", "true");
  }
}

/**
 * Obtains EXIF data for an image file.
 *
 * @param filePath The path to the image file.
 * @returns The EXIF data as a string.
 */
export const getFileExifData = async (filePath: string) => {
  /* Gets the EXIF data and metadata of an image file. */
  const exifData = await exifr.parse(filePath);
  const metadata = fs.statSync(filePath);
  return JSON.stringify({ ...exifData, ...metadata });
};

/**
 * Obtains a description of an image by using computer vision and EXIF data.
 *
 * @param filePath The path of the image file.
 * @param options A {@link CommandOptions} object describing the types of information to include in the output.
 * @returns The image description as a string.
 */
export const getImageDetails = async (filePath: string, options: CommandOptions): Promise<ImageData> => {
  const imageDetails = await ScriptRunner.ImageFeatureExtractor(
    filePath,
    options.useSubjectClassification || false,
    options.useBarcodeDetection || false,
    options.useFaceDetection || false,
    options.useRectangleDetection || false,
    options.useSaliencyAnalysis || false,
    options.useHorizonDetection || false,
  );
  const imageVisionInstructions = filterString(imageDetails.stringValue);
  const exifData =
    options.useMetadata && !filePath.endsWith(".svg") ? filterString(await getFileExifData(filePath)) : ``;
  const exifInstruction = options.useMetadata ? `<EXIF data: ###${exifData}###>` : ``;
  return {
    ...imageDetails,
    imageEXIFData: exifInstruction,
    stringValue: `${imageVisionInstructions}${exifInstruction}`,
  };
};

/**
 * Gets the metadata and sound classifications of an audio file.
 *
 * @param filePath The path of the audio file.
 * @param useMetadata Whether to include metadata in the output.
 *
 * @returns The metadata and sound classifications as a single string.
 */
export const getAudioDetails = async (filePath: string): Promise<AudioData> => {
  const soundClassifications = filterString((await ScriptRunner.SoundClassifier(filePath)).replace("_", " ")).trim();
  const classificationInstructions = `<Sound classifications: "${soundClassifications}".>`;
  return {
    stringValue: `${soundClassifications ? `\n${classificationInstructions}` : ""}`,
    soundClassifications: soundClassifications,
  };
};

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

/**
 * Unzips a compressed file to a temporary directory.
 * @param zipPath The path of the compressed file.
 * @returns The path of the temporary directory.
 */
export const unzipToTemp = async (zipPath: string) => {
  const dirPath = path.join(os.tmpdir(), `${path.basename(zipPath, ".zip")}`);
  if (fs.existsSync(dirPath)) {
    await fs.promises.rm(dirPath, { recursive: true });
  }

  try {
    // Unzip the file
    await new Promise((resolve) => {
      exec(`unzip "${zipPath}" -d "${dirPath}"`, (err) => {
        if (err) console.error(err);
      }).on("exit", async () => {
        resolve(true);
      });
    });

    // Remove the zip file
    await new Promise((resolve) => {
      exec(`rm "${zipPath}"`, (err) => {
        if (err) console.error(err);
      }).on("exit", async () => {
        resolve(true);
      });
    });
    return dirPath;
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * Loads custom placeholders from the custom-placeholders.json file in the support directory.
 * @returns The custom placeholders as a {@link PlaceholderList} object.
 */
export const loadCustomPlaceholders = async (settings: typeof defaultAdvancedSettings) => {
  try {
    const preferences = getPreferenceValues<ExtensionPreferences>();
    const customPlaceholdersPath = path.join(environment.supportPath, CUSTOM_PLACEHOLDERS_FILENAME);
    const customPlaceholderFiles = [
      customPlaceholdersPath,
      ...(settings.placeholderSettings.allowCustomPlaceholderPaths ? preferences.customPlaceholderFiles.split(/, ?/g) : []),
    ].filter(
      (customPlaceholdersPath) => customPlaceholdersPath.trim().length > 0 && fs.existsSync(customPlaceholdersPath),
    );

    const customPlaceholderFileContents = await Promise.all(
      customPlaceholderFiles.map(async (customPlaceholdersPath) => {
        try {
          return await fs.promises.readFile(customPlaceholdersPath, "utf-8");
        } catch (e) {
          return "";
        }
      }),
    );

    return customPlaceholderFileContents.reduce((acc, customPlaceholdersFile) => {
      try {
        const newPlaceholdersData = JSON.parse(customPlaceholdersFile);
        const newPlaceholders = (Object.entries(newPlaceholdersData) as [string, CustomPlaceholder][]).reduce(
          (acc, [key, placeholder]) => {
            try {
              const newPlaceholder: Placeholder = {
                name: placeholder.name,
                regex: new RegExp(key, "g"),
                apply: async (str: string, context?: { [key: string]: unknown }) => {
                  if (context?.[placeholder.name]?.toString()?.length) {
                    return {
                      result: context[placeholder.name] as string,
                      [placeholder.name]: context[placeholder.name],
                    };
                  }
                  const match = str.match(new RegExp(key, "g"));
                  let value = placeholder.value;
                  (match || []).forEach((m, index) => {
                    value = value.replaceAll(`$${index}`, m?.replaceAll("\\", "\\\\") || "");
                  });
                  const res: { [key: string]: string; result: string } = { result: value, [placeholder.name]: value };
                  res[placeholder.name] = value;
                  return res;
                },
                result_keys: [placeholder.name],
                constant: true,
                fn: async () => (await newPlaceholder.apply(`{{${key}}}`)).result,
                description: placeholder.description,
                example: placeholder.example,
                hintRepresentation: placeholder.hintRepresentation,
                fullRepresentation: `${placeholder.name} (Custom)`,
              };

              acc.push(newPlaceholder);
            } catch (e) {
              showToast({ title: `Failed to load placeholder "${key}"`, message: `Invalid regex.` });
            }
            return acc;
          },
          [] as Placeholder[],
        );
        return [...acc, ...newPlaceholders];
      } catch (e) {
        showToast({ title: "Invalid custom placeholders file", message: (e as Error).message });
        return acc;
      }
    }, [] as Placeholder[]);
  } catch (e) {
    return [] as Placeholder[];
  }
};
