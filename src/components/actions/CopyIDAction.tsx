import { Action } from "@raycast/api";
import { defaultAdvancedSettings } from "../../data/default-advanced-settings";
import { getActionShortcut, isActionEnabled } from "../../utils/action-utils";

/**
 * Base action to copy an object's ID to the clipboard.
 * @param props.id The ID to copy.
 * @param props.objectType The type of object to copy.
 * @param props.settings The advanced settings object.
 * @returns An action component.
 */
export default function CopyIDAction(props: {
  id: string;
  objectType: string;
  settings: typeof defaultAdvancedSettings;
}) {
  if (!isActionEnabled("CopyIDAction", props.settings)) {
    return null;
  }

  return (
    <Action.CopyToClipboard
      title={`Copy ${props.objectType} ID`}
      content={props.id}
      shortcut={getActionShortcut("CopyIDAction", props.settings)}
    />
  );
}
