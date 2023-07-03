import { Action, Alert, Icon, Toast, confirmAlert, showToast } from "@raycast/api";
import { defaultAdvancedSettings } from "../../data/default-advanced-settings";
import { isActionEnabled } from "../../utils/action-utils";

/**
 * Base action to delete an object.
 * @param props.deleteMethod The method to delete the object.
 * @param props.objectType The type of object to delete. Used in the alert title.
 * @param props.message The message to display in the toast on success.
 * @param props.settings The advanced settings object.
 * @returns An action component.
 */
export default function DeleteAction(props: {
  deleteMethod: () => Promise<void>;
  objectType: string;
  message?: string;
  settings: typeof defaultAdvancedSettings;
}) {
  if (!isActionEnabled("DeleteAction", props.settings)) {
    return null;
  }

  return (
    <Action
      title={`Delete ${props.objectType}`}
      icon={Icon.Trash}
      style={Action.Style.Destructive}
      shortcut={{ modifiers: ["cmd"], key: "d" }}
      onAction={async () => {
        if (
          await confirmAlert({
            title: `Delete ${props.objectType}`,
            message: "Are you sure?",
            primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
          })
        ) {
          const toast = await showToast({
            title: `Deleting ${props.objectType}...`,
            style: Toast.Style.Animated,
          });

          try {
            await props.deleteMethod();
            toast.title = `Deleted ${props.objectType}`;
            toast.message = props.message ? props.message : undefined;
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
