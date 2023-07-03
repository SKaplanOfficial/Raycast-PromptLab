import { Model, ModelManager } from "../../../utils/types";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import ToggleFavoriteAction from "../../actions/ToggleFavoriteAction";

/**
 * Action to toggle a model's favorite status.
 * @param props.model The model to toggle.
 * @param props.models The model manager object.
 * @returns An action component.
 */
export default function ToggleModelFavoriteAction(props: {
  model: Model;
  models: ModelManager;
  settings: typeof defaultAdvancedSettings;
}) {
  const { model, models, settings } = props;

  return (
    <ToggleFavoriteAction
      toggleMethod={async () => {
        await models.updateModel(model, { ...model, favorited: !model.favorited });
        await models.revalidate();
      }}
      currentStatus={model.favorited}
      settings={settings}
    />
  );
}
