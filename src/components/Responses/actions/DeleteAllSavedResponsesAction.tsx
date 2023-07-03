import { environment } from "@raycast/api";
import path from "path";
import * as fs from "fs";
import { SavedResponse } from "../../../utils/types";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import DeleteAllAction from "../../actions/DeleteAllAction";

/**
 * Action to delete all saved responses.
 * @param props.savedResponses The list of saved responses.
 * @param props.setSavedResponses The function to update the saved responses list.
 * @returns An action component.
 */
export default function DeleteAllSavedResponsesAction(props: {
  savedResponses: SavedResponse[];
  setSavedResponses: React.Dispatch<React.SetStateAction<SavedResponse[]>>;
  settings: typeof defaultAdvancedSettings;
}) {
  return (
    <DeleteAllAction
      deleteMethod={async () => {
        const savedResponsesDir = path.join(environment.supportPath, "saved-responses");
        for (const response of props.savedResponses) {
          const savedResponsePath = path.join(savedResponsesDir, `${response.id}.json`);
          await fs.promises.rm(savedResponsePath);
        }
        props.setSavedResponses([]);
      }}
      objectType="Saved Responses"
      settings={props.settings}
    />
  );
}
