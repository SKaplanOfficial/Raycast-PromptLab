/**
 * @file storage-utils.ts
 *
 * @summary Utility functions for interacting with local storage and supporting files.
 * @author Stephen Kaplan <skaplanofficial@gmail.com>
 *
 * Created at     : 2023-07-05 10:50:07
 * Last modified  : 2023-07-05 11:04:18
 */

import * as fs from "fs";
import path from "path";

import { environment, LocalStorage } from "@raycast/api";

import { defaultAdvancedSettings } from "../data/default-advanced-settings";
import { ADVANCED_SETTINGS_FILENAME } from "./constants";

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
 * Creates or overwrites the advanced settings file with the default advanced settings.
 * @returns True if the file was created successfully, false otherwise.
 */
export const createAdvancedSettingsFile = (): boolean => {
  const advancedSettingsPath = path.join(environment.supportPath, ADVANCED_SETTINGS_FILENAME);
  try {
    fs.writeFileSync(advancedSettingsPath, JSON.stringify(defaultAdvancedSettings, null, 2));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Validates the existence and structure of the advanced settings file.
 * @returns True if the file exists and is valid, false otherwise.
 */
export const validateAdvancedSettingsFile = (): boolean => {
  const advancedSettingsPath = path.join(environment.supportPath, ADVANCED_SETTINGS_FILENAME);

  // Validate existence
  if (!fs.existsSync(advancedSettingsPath)) {
    return false;
  }

  try {
    const currentSettings = JSON.parse(fs.readFileSync(advancedSettingsPath, "utf-8"));

    // Validate JSON parsability
    if (typeof currentSettings !== "object") {
      return false;
    }

    // Validate presence of all keys
    for (const key of Object.keys(defaultAdvancedSettings)) {
      if (!(key in currentSettings)) {
        return false;
      }
      
      // Validate value types (does not validate actual content of values)
      if (typeof currentSettings[key] !== typeof (defaultAdvancedSettings as { [key: string]: unknown})[key]) {
        return false;
      }
    }
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
};

/**
 * Immediately loads the advanced settings from the advanced settings file.
 * @returns The advanced settings object.
 */
export const loadAdvancedSettingsSync = () => {
  const advancedSettingsPath = path.join(environment.supportPath, ADVANCED_SETTINGS_FILENAME);
  if (!validateAdvancedSettingsFile()) {
    createAdvancedSettingsFile();
  }

  try {
    const currentSettings = JSON.parse(fs.readFileSync(advancedSettingsPath, "utf-8"));
    return currentSettings as typeof defaultAdvancedSettings;
  } catch (error) {
    console.error(error);
    return defaultAdvancedSettings;
  }
};
