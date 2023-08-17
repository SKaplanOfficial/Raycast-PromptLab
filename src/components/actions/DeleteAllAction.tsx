import { Action, Alert, Icon, Toast, confirmAlert, showToast } from "@raycast/api";
import { defaultAdvancedSettings } from "../../data/default-advanced-settings";
import { getActionShortcut, isActionEnabled } from "../../utils/action-utils";

/**
 * Base action to delete all objects of a given type.
 * @param props.deleteMethod The method to delete all objects.
 * @param props.objectType The type of object to delete. Used in the alert title.
 * @param props.settings The advanced settings object.
 * @returns An action component.
 */
export default function DeleteAllAction(props: {
  deleteMethod: () => Promise<void>;
  objectType: string;
  settings: typeof defaultAdvancedSettings;
}) {
  if (!isActionEnabled("DeleteAllAction", props.settings)) {
    return null;
  }

  return (
    <Action
      title={`Delete All ${props.objectType}`}
      icon={Icon.Trash}
      shortcut={getActionShortcut("DeleteAllAction", props.settings)}
      style={Action.Style.Destructive}
      onAction={async () => {
        if (
          await confirmAlert({
            title: `Delete All ${props.objectType}`,
            message: `Are you sure?`,
            primaryAction: {
              title: "Delete",
              style: Alert.ActionStyle.Destructive,
            },
          })
        ) {
          const toast = await showToast({ title: `Deleting ${props.objectType}...`, style: Toast.Style.Animated });
          try {
            await props.deleteMethod();
            toast.title = `Deleted All ${props.objectType}`;
            toast.style = Toast.Style.Success;
          } catch (error) {
            console.error(error);
            toast.title = `Failed to Delete ${props.objectType}`;
            toast.style = Toast.Style.Failure;
          }
        }
      }}
    />
  );
}
