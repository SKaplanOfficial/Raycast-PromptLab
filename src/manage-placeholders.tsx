import { List } from "@raycast/api";
import { useAdvancedSettings } from "./hooks/useAdvancedSettings";
import { useCustomPlaceholders } from "./hooks/useCustomPlaceholders";
import PlaceholdersActionPanel from "./components/Placeholders/actions/PlaceholdersActionPanel";
import NoPlaceholdersView from "./components/Placeholders/NoPlaceholdersView";
import PlaceholderListItem from "./components/Placeholders/PlaceholderListItem";

/**
 * View for managing custom placeholders.
 * @returns A list view component.
 */
export default function ManagePlaceholders() {
  const { customPlaceholders, isLoading, revalidate } = useCustomPlaceholders();
  const { advancedSettings } = useAdvancedSettings();

  const listItems = Object.entries(customPlaceholders).map(([key, placeholder]) => (
    <PlaceholderListItem
      settings={advancedSettings}
      customPlaceholders={customPlaceholders}
      placeholderKey={key}
      placeholder={placeholder}
      revalidatePlaceholders={revalidate}
    />
  ));

  return (
    <List
      isLoading={isLoading}
      actions={<PlaceholdersActionPanel settings={advancedSettings} revalidatePlaceholders={revalidate} />}
    >
      <NoPlaceholdersView totalCount={listItems.length} />
      {listItems}
    </List>
  );
}
