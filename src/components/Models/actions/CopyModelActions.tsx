import { Action } from "@raycast/api";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import { Model, ModelManager } from "../../../utils/types";
import { isActionEnabled } from "../../../utils/action-utils";

/**
 * Action to copy all models' JSON representation to the clipboard.
 * @param props.models The model manager object.
 * @param props.settings The advanced settings object.
 * @returns An action component.
 */
export const CopyAllModelsJSONAction = (props: { models: ModelManager; settings: typeof defaultAdvancedSettings }) => {
  const { models, settings } = props;

  if (!isActionEnabled("CopyAllModelsJSONAction", settings)) {
    return null;
  }

  return (
    <Action.CopyToClipboard
      title="Copy JSON For All Models"
      content={(() => {
        const value: { [key: string]: Model } = {};
        for (const model of models.models) {
          const key = `--model-${model.name}`;
          value[key] = { ...model, id: "", apiKey: "" };
        }
        return JSON.stringify(value);
      })()}
      shortcut={{ modifiers: ["cmd", "shift", "opt"], key: "j" }}
    />
  );
};
