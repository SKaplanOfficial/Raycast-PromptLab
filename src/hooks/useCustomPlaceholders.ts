import { useEffect, useState } from "react";
import { PlaceholderList } from "../utils/types";
import { installDefaults } from "../utils/file-utils";
import { loadCustomPlaceholders } from "../utils/placeholders";
import { loadAdvancedSettingsSync } from "../utils/storage-utils";

/**
 * Hook for accessing the user's custom placeholders.
 * @returns The custom placeholders and a function to revalidate them.
 */
export function useCustomPlaceholders() {
  const [customPlaceholders, setCustomPlaceholders] = useState<PlaceholderList>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.resolve(installDefaults()).then(() => {
      const settings = loadAdvancedSettingsSync();
      Promise.resolve(loadCustomPlaceholders(settings.placeholderSettings)).then((placeholders) => {
        setCustomPlaceholders(placeholders);
        setIsLoading(false);
      });
    });
  }, []);

  const revalidate = async () => {
    const settings = loadAdvancedSettingsSync();
    const placeholders = await loadCustomPlaceholders(settings.placeholderSettings);
    setCustomPlaceholders(placeholders);
    setIsLoading(false);
  };

  return {
    customPlaceholders,
    isLoading,
    revalidate,
  }
}
