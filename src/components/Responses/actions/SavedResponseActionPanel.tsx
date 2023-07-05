/**
 * @file SavedResponseActionPanel.tsx
 *
 * @summary Action panel for saved response list views.
 * @author Stephen Kaplan <skaplanofficial@gmail.com>
 *
 * Created at     : 2023-07-05 08:11:28
 * Last modified  : 2023-07-05 08:11:31
 */

import { ActionPanel } from '@raycast/api';

import { defaultAdvancedSettings } from '../../../data/default-advanced-settings';
import { getObjectJSON } from '../../../utils/command-utils';
import { SavedResponse } from '../../../utils/types';
import AdvancedActionSubmenu from '../../actions/AdvancedActionSubmenu';
import CopyIDAction from '../../actions/CopyIDAction';
import CopyJSONAction from '../../actions/CopyJSONAction';
import CopyNameAction from '../../actions/CopyNameAction';
import EditAction from '../../actions/EditAction';
import ResponseForm from '../ResponseForm';
import DeleteAllSavedResponsesAction from './DeleteAllSavedResponsesAction';
import DeleteSavedResponseAction from './DeleteSavedResponseAction';
import ToggleFavoriteSavedResponseAction from './ToggleFavoriteSavedResponseAction';

/**
 * Action panel for saved responses.
 * @param props.response The currently selected saved response.
 * @param props.savedResponses The saved responses.
 * @param props.setSavedResponses The function to update the list of saved responses.
 * @param props.advancedSettings The advanced settings object.
 * @returns An action panel component.
 */
export default function SavedResponseActionPanel(props: {
  response: SavedResponse;
  savedResponses: SavedResponse[];
  setSavedResponses: React.Dispatch<React.SetStateAction<SavedResponse[]>>;
  advancedSettings: typeof defaultAdvancedSettings;
}) {
  const { response, savedResponses, setSavedResponses, advancedSettings } = props;
  return (
    <ActionPanel>
      <EditAction
        objectType="Saved Response"
        settings={advancedSettings}
        target={<ResponseForm response={response} setSavedResponses={setSavedResponses} />}
      />
      <ToggleFavoriteSavedResponseAction
        response={response}
        savedResponses={savedResponses}
        setSavedResponses={setSavedResponses}
        settings={advancedSettings}
      />
      
      <CopyNameAction name={response.name} objectType="Saved Response" settings={advancedSettings} />
      <CopyIDAction id={response.id} objectType="Saved Response" settings={advancedSettings} />
      <CopyJSONAction content={getObjectJSON(response)} objectType="Saved Response" settings={advancedSettings} />

      <DeleteSavedResponseAction
        response={response}
        savedResponses={savedResponses}
        setSavedResponses={setSavedResponses}
        settings={advancedSettings}
      />
      <DeleteAllSavedResponsesAction
        savedResponses={savedResponses}
        setSavedResponses={setSavedResponses}
        settings={advancedSettings}
      />
      <AdvancedActionSubmenu settings={advancedSettings} />
    </ActionPanel>
  );
}
