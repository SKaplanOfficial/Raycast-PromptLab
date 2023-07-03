import { environment } from "@raycast/api";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import path from "path";
import * as fs from "fs";
import { SavedResponse } from "../../../utils/types";
import DeleteAction from "../../actions/DeleteAction";

/**
 * Action to delete a saved response.
 * @param props.response The saved response to delete.
 * @param props.savedResponses The list of saved responses.
 * @param props.setSavedResponses The function to update the saved responses list.
 * @param props.settings The advanced settings object.
 * @returns An action component.
 */
export default function DeleteSavedResponseAction(props: {
  response: SavedResponse;
  savedResponses: SavedResponse[];
  setSavedResponses: React.Dispatch<React.SetStateAction<SavedResponse[]>>;
  settings: typeof defaultAdvancedSettings;
}) {
  return (
    <DeleteAction
      deleteMethod={async () => {
        const savedResponsesDir = path.join(environment.supportPath, "saved-responses");
        const savedResponsePath = path.join(savedResponsesDir, `${props.response.id}.json`);
        await fs.promises.rm(savedResponsePath);
        props.setSavedResponses(props.savedResponses.filter((r) => r.id != props.response.id));
      }}
      objectType="Saved Response"
      settings={props.settings}
    />
  );
}
