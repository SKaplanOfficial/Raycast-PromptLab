/**
 * @file manage-models.tsx
 *
 * @summary Raycast command to manage models in the PromptLab extension.
 * @author Stephen Kaplan <skaplanofficial@gmail.com>
 *
 * Created at     : 2023-07-04 23:21:41
 * Last modified  : yyyy-07-dd 08:11:48
 */

import { Color, Icon, List } from "@raycast/api";

import ManageModelsActionPanel from "./components/Models/actions/ManageModelsActionsPanel";
import { useAdvancedSettings } from "./hooks/useAdvancedSettings";
import { useModels } from "./hooks/useModels";
import { Model } from "./utils/types";

export default function ManageModels() {
  const models = useModels();
  const { advancedSettings } = useAdvancedSettings();

  /**
   * Converts a model to a list item.
   * @param model The model to convert.
   * @returns The list item.
   */
  const modelToItem = (model: Model) => (
    <List.Item
      title={model.name}
      subtitle={model.description}
      key={model.id}
      icon={{ source: model.icon, tintColor: model.iconColor }}
      accessories={[
        {
          icon: model.isDefault ? Icon.Checkmark : undefined,
          tooltip: model.isDefault ? "Default Model" : undefined,
        },
        {
          icon: model.favorited ? { source: Icon.StarCircle, tintColor: Color.Yellow } : undefined,
          tooltip: model.favorited ? "Favorited" : undefined,
        },
      ]}
      actions={<ManageModelsActionPanel model={model} models={models} settings={advancedSettings} />}
    />
  );

  // Sort models into two sections: favorites and others
  const favorites = <List.Section key="favorites" title="Favorites" children={models.favorites().map(modelToItem)} />;
  const others = <List.Section key="others" title="Others" children={models.others().map(modelToItem)} />;

  return (
    <List
      isLoading={models.isLoading}
      actions={<ManageModelsActionPanel models={models} settings={advancedSettings} />}
    >
      <List.EmptyView
        title="No Custom Models"
        description="Add a model to get started."
        icon={{ source: "no-view.png" }}
      />
      {models.favorites().length > 0 && favorites}
      {models.others().length > 0 && others}
    </List>
  );
}
