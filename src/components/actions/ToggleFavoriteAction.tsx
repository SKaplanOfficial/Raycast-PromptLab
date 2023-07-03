import { Action, Icon, Toast, showToast } from "@raycast/api";
import { defaultAdvancedSettings } from "../../data/default-advanced-settings";
import { isActionEnabled } from "../../utils/action-utils";

/**
 * Base action to toggle an object's favorite status.
 * @param props.currentStatus The current favorited status of the object.
 * @param props.toggleMethod The method to toggle the object's favorite status.
 * @returns An action component.
 */
export default function ToggleFavoriteAction(props: {
  currentStatus: boolean;
  toggleMethod: () => Promise<void>;
  settings: typeof defaultAdvancedSettings;
}) {
  if (!isActionEnabled("ToggleFavoriteAction", props.settings)) {
    return null;
  }

  return (
    <Action
      title={props.currentStatus ? "Remove From Favorites" : "Add To Favorites"}
      icon={props.currentStatus ? Icon.StarDisabled : Icon.StarCircle}
      shortcut={{ modifiers: ["cmd", "shift"], key: "f" }}
      onAction={async () => {
        try {
          await props.toggleMethod();
          await showToast({
            title: props.currentStatus ? `Removed From Favorites` : `Added To Favorites`,
            style: Toast.Style.Success,
          });
        } catch (error) {
          console.error(error);
          await showToast({
            title: props.currentStatus ? `Failed to Remove From Favorites` : `Failed to Add To Favorites`,
            style: Toast.Style.Failure,
          });
        }
      }}
    />
  );
}
