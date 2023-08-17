import { Action, Icon } from "@raycast/api";
import { defaultAdvancedSettings } from "../../data/default-advanced-settings";
import { getActionShortcut, isActionEnabled } from "../../utils/action-utils";

/**
 * Base action to open the edit form for an object.
 * @param props.objectType The type of object to edit.
 * @param props.settings The advanced settings object.
 * @param props.target The target component to open.
 * @returns An action component.
 */
export default function EditAction(props: {
  objectType: string;
  settings: typeof defaultAdvancedSettings;
  target: JSX.Element;
}) {
  const { objectType, settings, target } = props;

  if (!isActionEnabled("EditAction", settings)) {
    return null;
  }

  return (
    <Action.Push
      title={`Edit ${objectType}`}
      icon={Icon.Pencil}
      shortcut={getActionShortcut("EditAction", settings)}
      target={target}
    />
  );
}
