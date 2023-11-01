import { Action, ActionPanel, Icon } from "@raycast/api";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import { getActionShortcut, isActionEnabled } from "../../../utils/action-utils";
import { deleteCustomPlaceholder, getCustomPlaceholder } from "../../../utils/placeholders";
import { Placeholder, PlaceholderList } from "../../../utils/types";
import EditPlaceholderAction from "./EditPlaceholderAction";
import CopyNameAction from "../../actions/CopyNameAction";
import CopyJSONAction from "../../actions/CopyJSONAction";
import DeleteAction from "../../actions/DeleteAction";
import DeleteAllAction from "../../actions/DeleteAllAction";
import AdvancedActionSubmenu from "../../actions/AdvancedActionSubmenu";
import CopyCurrentValueAction from "./CopyCurrentValueAction";

/**
 * Action panel for managing placeholders.
 *
 * @param props.settings The advanced settings object.
 * @param props.customPlaceholders The list of custom placeholders.
 * @param props.placeholderKey The key of the placeholder to apply.
 * @param props.placeholder The placeholder data to apply.
 * @param props.revalidatePlaceholders A function to revalidate the list of custom placeholders.
 * @returns An action component.
 */
export default function PlaceholdersActionPanel(props: {
  settings: typeof defaultAdvancedSettings;
  customPlaceholders?: PlaceholderList;
  placeholderKey?: string;
  placeholder?: Placeholder;
  revalidatePlaceholders: () => Promise<void>;
}) {
  const { customPlaceholders, settings, placeholderKey, placeholder, revalidatePlaceholders } = props;

  if (!isActionEnabled("CopyCurrentValueAction", settings)) {
    return null;
  }

  if (!placeholderKey || !placeholder || !customPlaceholders) {
    return (
      <ActionPanel>
        <EditPlaceholderAction settings={settings} revalidatePlaceholders={revalidatePlaceholders} />
      </ActionPanel>
    );
  }

  return (
    <ActionPanel>
      <EditPlaceholderAction settings={settings} revalidatePlaceholders={revalidatePlaceholders} />
      <ActionPanel.Section title="Placeholder Actions">
        <EditPlaceholderAction
          settings={settings}
          placeholderKey={placeholderKey}
          placeholderData={placeholder}
          revalidatePlaceholders={revalidatePlaceholders}
        />
        <CopyCurrentValueAction settings={settings} placeholderKey={placeholderKey} placeholderData={placeholder} />
        <CopyNameAction name={placeholder.name} objectType="Placeholder" settings={settings} />
        <CopyJSONAction
          content={async () => ({
            [placeholderKey]: await getCustomPlaceholder(placeholderKey, placeholder),
          })}
          objectType="Placeholder"
          settings={settings}
        />
        <Action
          title="Open Source File"
          icon={Icon.Document}
          onAction={async () => {
            if (!placeholder.source) {
              return;
            }
            await open(placeholder.source);
          }}
        />
        <DeleteAction
          deleteMethod={async () => {
            await deleteCustomPlaceholder(placeholderKey, placeholder);
            await revalidatePlaceholders();
          }}
          objectType="Custom Placeholder"
          message={placeholder.name}
          settings={settings}
        />
        <DeleteAllAction
          deleteMethod={async () => {
            for (const entry of Object.entries(customPlaceholders)) {
              await deleteCustomPlaceholder(entry[0], entry[1]);
            }
            await revalidatePlaceholders();
          }}
          objectType="Custom Placeholders"
          settings={settings}
        />
      </ActionPanel.Section>
      <AdvancedActionSubmenu settings={settings} />
    </ActionPanel>
  );
}
