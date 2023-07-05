import { LocalStorage, environment } from "@raycast/api";
import path from "path";
import { ADVANCED_SETTINGS_FILENAME } from "./constants";
import { defaultAdvancedSettings } from "../data/default-advanced-settings";
import * as fs from "fs";

/**
 * Sets the value of a local storage key.
 * @param key The key to set the value of.
 * @param value The string value to set the key to.
 */
export const setStorage = async (key: string, value: unknown) => {
  await LocalStorage.setItem(key, JSON.stringify(value));
};

/**
 * Gets the value of a local storage key.
 * @param key The key to get the value of.
 * @returns The JSON-parsed value of the key.
 */
export const getStorage = async (key: string) => {
  const localStorage = await LocalStorage.getItem<string>(key);
  const storageString = typeof localStorage === "undefined" ? "" : localStorage;
  return storageString == "" ? [] : JSON.parse(storageString);
};

/**
 * Immediately loads the advanced settings from the advanced settings file.
 * @returns The advanced settings object.
 */
export const loadAdvancedSettingsSync = () => {
  const advancedSettingsPath = path.join(environment.supportPath, ADVANCED_SETTINGS_FILENAME);
  if (!fs.existsSync(advancedSettingsPath)) {
    try {
      fs.writeFileSync(advancedSettingsPath, JSON.stringify(defaultAdvancedSettings, null, 2));
    } catch (error) {
      console.log(error);
      return defaultAdvancedSettings;
    }
  }

  try {
    const currentSettings = JSON.parse(fs.readFileSync(advancedSettingsPath, "utf-8"));
    return currentSettings as typeof defaultAdvancedSettings;
  } catch (error) {
    console.log(error);
    return defaultAdvancedSettings;
  }
};
