import { Icon, List } from "@raycast/api";
import { Placeholder, PlaceholderList } from "../../utils/types";
import PlaceholdersActionPanel from "./actions/PlaceholdersActionPanel";
import { defaultAdvancedSettings } from "../../data/default-advanced-settings";

/**
 * A list item for a custom placeholder.
 * @param props.settings The advanced settings object.
 * @param props.customPlaceholders The list of custom placeholders.
 * @param props.placeholderKey The key of the placeholder to display in the list item.
 * @param props.placeholder The placeholder data to display in the list item.
 * @param props.revalidatePlaceholders A function to revalidate the list of custom placeholders.
 * @returns An list item component.
 */
export default function PlaceholderListItem(props: {
  settings: typeof defaultAdvancedSettings;
  customPlaceholders: PlaceholderList;
  placeholderKey: string;
  placeholder: Placeholder;
  revalidatePlaceholders: () => Promise<void>;
}) {
  const { settings, customPlaceholders, placeholderKey, placeholder, revalidatePlaceholders } = props;

  const nameComponents = placeholder.name.split(/(?=[A-Z])/);
  const camelCaseName = `${nameComponents[0][0].toUpperCase()}${nameComponents[0].slice(1)}${
    nameComponents.length > 1 ? ` ${nameComponents.slice(1).join(" ")}` : ""
  }`;

  return (
    <List.Item
      title={camelCaseName}
      subtitle={placeholder.hintRepresentation.length > 4 ? placeholder.hintRepresentation : `{{${placeholder.name}}}`}
      key={placeholderKey}
      accessories={[
        placeholder.description.length > 0
          ? {
              icon: Icon.Info,
              tooltip: placeholder.description,
            }
          : {},
        {
          icon: Icon.Document,
          tooltip: `Source: ${placeholder.source}`,
        },
      ]}
      actions={
        <PlaceholdersActionPanel
          customPlaceholders={customPlaceholders}
          settings={settings}
          placeholderKey={placeholderKey}
          placeholder={placeholder}
          revalidatePlaceholders={revalidatePlaceholders}
        />
      }
    />
  );
}
