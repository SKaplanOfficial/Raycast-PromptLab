import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import { Model, ModelManager } from "../../../utils/types";
import DeleteAllAction from "../../actions/DeleteAllAction";
import DeleteAction from "../../actions/DeleteAction";

/**
 * Action to delete a model.
 * @param props.model The model to delete.
 * @param props.models The model manager object.
 * @param props.settings The advanced settings object.
 * @returns An action component.
 */
export const DeleteModelAction = (props: {
  model: Model;
  models: ModelManager;
  settings: typeof defaultAdvancedSettings;
}) => {
  return (
    <DeleteAction
      deleteMethod={async () => {
        await props.models.deleteModel(props.model);
        await props.models.revalidate();
      }}
      objectType="Model"
      message={props.model.name}
      settings={props.settings}
    />
  );
};

/**
 * Action to delete all models.
 * @param props.models The model manager object.
 * @param props.settings The advanced settings object.
 * @returns An action component.
 */
export const DeleteAllModelsAction = (props: { models: ModelManager; settings: typeof defaultAdvancedSettings }) => {
  return (
    <DeleteAllAction
      deleteMethod={async () => {
        for (const model of props.models.models) {
          await props.models.deleteModel(model);
          await props.models.revalidate();
        }
      }}
      objectType="Models"
      settings={props.settings}
    />
  );
};
