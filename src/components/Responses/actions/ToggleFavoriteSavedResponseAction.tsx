import path from "path";
import { SavedResponse } from "../../../utils/types";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import * as fs from "fs";
import ToggleFavoriteAction from "../../actions/ToggleFavoriteAction";
import { environment } from "@raycast/api";

/**
 * Action to toggle a saved response's favorite status.
 * @param props.response The saved response whose favorite status to toggle.
 * @param props.savedResponses The list of saved responses.
 * @param props.setSavedResponses The function to update the saved responses list.
 * @param props.settings The advanced settings object.
 * @returns An action component.
 */
export default function ToggleFavoriteSavedResponseAction(props: {
  response: SavedResponse;
  savedResponses: SavedResponse[];
  setSavedResponses: React.Dispatch<React.SetStateAction<SavedResponse[]>>;
  settings: typeof defaultAdvancedSettings;
}) {
  const { response, savedResponses, setSavedResponses, settings } = props;

  return (
    <ToggleFavoriteAction
      toggleMethod={async () => {
        const newResponse = { ...response, favorited: !response.favorited };
        const newResponses = savedResponses.map((r) => (r.id == response.id ? newResponse : r));
        const savedResponsesDir = path.join(environment.supportPath, "saved-responses");
        const savedResponsePath = path.join(savedResponsesDir, `${response.id}.json`);
        await fs.promises.writeFile(savedResponsePath, JSON.stringify(newResponse));
        setSavedResponses(newResponses);
      }}
      currentStatus={response.favorited}
      settings={settings}
    />
  );
}
