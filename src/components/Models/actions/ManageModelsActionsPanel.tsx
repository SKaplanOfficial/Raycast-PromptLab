import { ActionPanel } from "@raycast/api";
import AddNewModelAction from "./AddNewModelAction";
import ToggleModelFavoriteAction from "./ToggleModelFavoriteAction";
import ToggleModelDefaultAction from "./ToggleModelDefaultAction";
import { CopyAllModelsJSONAction } from "./CopyModelActions";
import CreateModelDerivativeAction from "./CreateModelDerivativeAction";
import { DeleteAllModelsAction, DeleteModelAction } from "./DeleteModelActions";
import AdvancedActionSubmenu from "../../actions/AdvancedActionSubmenu";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import { anyActionsEnabled } from "../../../utils/action-utils";
import { Model, ModelManager } from "../../../utils/types";
import CopyIDAction from "../../actions/CopyIDAction";
import CopyJSONAction from "../../actions/CopyJSONAction";
import { getObjectJSON } from "../../../utils/command-utils";
import CopyNameAction from "../../actions/CopyNameAction";
import EditAction from "../../actions/EditAction";
import ModelForm from "../ModelForm";

/**
 * Action panel for managing models.
 * @param props.model The model to manage.
 * @param props.models The model manager object.
 * @param props.settings The advanced settings object.
 * @returns An action panel component.
 */
export default function ManageModelsActionPanel(props: {
  model?: Model;
  models: ModelManager;
  settings: typeof defaultAdvancedSettings;
}) {
  const { model, models, settings } = props;
  return (
    <ActionPanel>
      <AddNewModelAction models={models} settings={settings} />
      {model &&
      anyActionsEnabled(
        [
          "EditAction",
          "ToggleFavoriteAction",
          "ToggleModelDefaultAction",
          "CopyAllModelsJSONAction",
          "CreateModelDerivativeAction",
          "DeleteAction",
          "DeleteAllAction",
          "CopyJSONAction",
          "CopyIDAction",
          "CopyNameAction",
        ],
        settings
      ) ? (
        <ActionPanel.Section title="Model Actions">
          <EditAction
            objectType="Model"
            settings={settings}
            target={<ModelForm models={models} currentModel={model} />}
          />
          <ToggleModelFavoriteAction model={model} models={models} settings={settings} />
          <ToggleModelDefaultAction model={model} models={models} settings={settings} />
          <CopyNameAction name={model.name} objectType="Model" settings={settings} />
          <CopyIDAction id={model.id} objectType="Model" settings={settings} />
          <CopyJSONAction content={getObjectJSON(model)} objectType="Model" settings={settings} />
          <CopyAllModelsJSONAction models={models} settings={settings} />
          <CreateModelDerivativeAction model={model} models={models} settings={settings} />
          <DeleteModelAction model={model} models={models} settings={settings} />
          <DeleteAllModelsAction models={models} settings={settings} />
        </ActionPanel.Section>
      ) : null}
      <AdvancedActionSubmenu settings={settings} />
    </ActionPanel>
  );
}
