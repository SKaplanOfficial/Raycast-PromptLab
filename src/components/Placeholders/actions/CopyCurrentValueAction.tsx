import { Action, Clipboard, Icon, showToast } from "@raycast/api";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import { getActionShortcut, isActionEnabled } from "../../../utils/action-utils";
import { Placeholders, getCustomPlaceholder } from "../../../utils/placeholders";
import { Placeholder } from "../../../utils/types";

/**
 * Action to copy the current value of a placeholder to the clipboard.
 * 
 * This applies all placeholders to the value of the given placeholder, then copies the result to the clipboard.
 * 
 * @param props.settings The advanced settings object.
 * @param props.placeholderKey The key of the placeholder to apply.
 * @param props.placeholderData The placeholder data to apply.
 * @returns An action component.
 */
export default function CopyCurrentValueAction(props: {
  settings: typeof defaultAdvancedSettings;
  placeholderKey: string;
  placeholderData: Placeholder;
}) {
  const { settings, placeholderKey, placeholderData } = props;

  if (!isActionEnabled("CopyCurrentValueAction", settings)) {
    return null;
  }

  return (
    <Action
      title="Copy Current Value"
      icon={Icon.Clipboard}
      shortcut={getActionShortcut("CopyCurrentValueAction", settings)}
      onAction={async () => {
        const customPlaceholder = await getCustomPlaceholder(placeholderKey, placeholderData);
        const value = await Placeholders.bulkApply(customPlaceholder.value, {})
        await Clipboard.copy(value);
        await showToast({ title: `Copied Placeholder Value`, message: value })
      }}
    />
  );
}
