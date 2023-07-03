import { Action, Icon } from "@raycast/api";
import ResponseForm from "../ResponseForm";
import { SavedResponse } from "../../../utils/types";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import { isActionEnabled } from "../../../utils/action-utils";

/**
 * Action to edit a saved response.
 * @param props.response The saved response to edit.
 * @param props.setSavedResponses The function to update the saved responses list.
 * @param props.settings The advanced settings object.
 * @returns An action component.
 */
export default function EditSavedResponseAction(props: {
  response: SavedResponse;
  setSavedResponses: React.Dispatch<React.SetStateAction<SavedResponse[]>>;
  settings: typeof defaultAdvancedSettings;
}) {
  const { response, setSavedResponses } = props;

  if (!isActionEnabled("EditSavedResponseAction", props.settings)) {
    return null;
  }

  return (
    <Action.Push
      title="Edit Response Settings"
      target={<ResponseForm response={response} setSavedResponses={setSavedResponses} />}
      icon={Icon.Pencil}
      shortcut={{ modifiers: ["cmd"], key: "e" }}
    />
  );
}
