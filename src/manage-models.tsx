import { Action, ActionPanel, Color, Icon, List, LocalStorage } from "@raycast/api";
import { useModels } from "./hooks/useModels";
import ModelForm from "./components/ModelForm";
import { useEffect } from "react";

export default function ManageModels() {
  const models = useModels();

  const listItems = models.models.map((model) => {
    return (
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
        actions={
          <ActionPanel>
            <Action.Push
              title="Edit Model"
              icon={Icon.Pencil}
              shortcut={{ modifiers: ["cmd"], key: "e" }}
              target={<ModelForm models={models} currentModel={model} />}
            />
          </ActionPanel>
        }
      />
    );
  });

  const favorites = models.models.filter((model) => model.favorited);
  const otherModels = models.models.filter((model) => !model.favorited);

  return (
    <List
      isLoading={models.isLoading}
      actions={
        <ActionPanel>
          <Action.Push
            title="Add New Model"
            icon={Icon.PlusCircle}
            shortcut={{ modifiers: ["cmd"], key: "n" }}
            target={<ModelForm models={models} />}
          />
        </ActionPanel>
      }
    >
      <List.EmptyView title="No models yet, add one to get started." icon={Icon.PlusCircle} />
      {favorites.length ? (
        <List.Section title="Favorites">
          {listItems.filter((item) => favorites.map((model) => model.name).includes(item.props.title))}
        </List.Section>
      ) : null}
        {otherModels.length ? (
        <List.Section title={favorites.length ? "Other Models" : "All Models"}>
            {listItems.filter((item) => otherModels.map((model) => model.name).includes(item.props.title))}
        </List.Section>
        ) : null}
    </List>
  );
}
