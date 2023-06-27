/**
 * The base URL for the PromptLab Store API.
 */
export const STORE_ENDPOINT = "https://v1.slashapi.com/promptlab/google-sheets/LMFCs9cU5Y/sheet1";

/**
 * The API key for the PromptLab Store API.
 * This key only permits reading and writing commands, not deleting or otherwise modifying them.
 */
export const STORE_KEY = "SCH4kmgzqxxFuCWDWayRV07OqHmLXfxmlMxu0G0Y";

/**
 * The base URL for the PromptLab QuickLinks.
 */
export const QUICKLINK_URL_BASE =
  "raycast://extensions/HelloImSteven/promptlab/search-commands?arguments=%7B%22commandName%22:%22";

/**
 * The filename for the placeholders guide in the support directory.
 */
export const PLACEHOLDERS_GUIDE_FILENAME = "placeholders_guide.md";

/**
 * The filename for the custom placeholders file in the support directory.
 */
export const CUSTOM_PLACEHOLDERS_FILENAME = "custom_placeholders.json";

/**
 * The filename for the advanced settings file in the support directory.
 */
export const ADVANCED_SETTINGS_FILENAME = "advanced_settings.json";

export const StorageKeys = {
  /**
   * Key for the list of persistent variables as JSON objects containing the variable's name,  value, and initial (default) value.
   */
  PERSISTENT_VARIABLES: "--persistent-variables",

  /**
   * Key for the list of UUIDs used in placeholders thus far.
   */
  USED_UUIDS: "--uuids",
}