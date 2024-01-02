import { createContext, useContext, useEffect, useState } from "react";
import * as fs from "fs";
import { AdvancedSettings, defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import { ADVANCED_SETTINGS_FILENAME } from "../../constants";
import { environment, showToast } from "@raycast/api";
import path from "path";

type AdvancedSettingsContextState = {
  /**
   * The advanced settings object.
   */
  advancedSettings: AdvancedSettings;

  /**
   * Reloads the advanced settings.
   */
  revalidate: () => void;

  /**
   * Whether the advanced settings are loading.
   */
  isLoading: boolean;
};

const AdvancedSettingsContextDefaultState: AdvancedSettingsContextState = {
  advancedSettings: defaultAdvancedSettings,
  revalidate: () => {},
  isLoading: true,
};

export const AdvancedSettingsContext = createContext<AdvancedSettingsContextState>(AdvancedSettingsContextDefaultState);

export function useAdvancedSettingsContextState() {
  const [advancedSettings, setAdvancedSettings] = useState(defaultAdvancedSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const advancedSettingsPath = path.join(environment.supportPath, ADVANCED_SETTINGS_FILENAME);

  /**
   * Creates the advanced settings file.
   */
  const createAdvancedSettings = async () => {
    try {
      await fs.promises.writeFile(advancedSettingsPath, JSON.stringify(defaultAdvancedSettings, null, 2));
    } catch (error) {
      await showToast({ title: "Error", message: "Could not create advanced settings file." });
    }
  };

  /**
   * Loads settings from the advanced settings file.
   */
  const loadAdvancedSettings = async () => {
    if (!fs.existsSync(advancedSettingsPath)) {
      await createAdvancedSettings();
    }

    try {
      const advancedSettingsValues = JSON.parse(fs.readFileSync(advancedSettingsPath, "utf-8"));
      setAdvancedSettings(advancedSettingsValues);
    } catch (error) {
      await showToast({ title: "Error", message: "Could not load advanced settings file." });
    }
  };

  /**
   * Reloads the advanced settings.
   */
  const revalidateAdvancedSettings = async () => {
    setIsLoading(true);
    await loadAdvancedSettings();
    setIsLoading(false);
  };

  useEffect(() => {
    revalidateAdvancedSettings();
  }, []);

  return {
    advancedSettings,
    revalidate: revalidateAdvancedSettings,
    isLoading,
  };
}

export function useAdvancedSettingsContext() {
  return useContext(AdvancedSettingsContext);
}

export default AdvancedSettingsContext;
