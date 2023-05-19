import {
  Action,
  ActionPanel,
  Alert,
  Color,
  Icon,
  List,
  confirmAlert,
  environment,
  showToast,
  useNavigation,
} from "@raycast/api";
import { useModels } from "./hooks/useModels";
import ModelForm from "./components/ModelForm";
import { Model } from "./utils/types";

export default function ManageModels() {
  const { push } = useNavigation();
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
              title="Add New Model"
              icon={Icon.PlusCircle}
              shortcut={{ modifiers: ["cmd"], key: "n" }}
              target={<ModelForm models={models} />}
            />
            <ActionPanel.Section title="Model Actions">
              <Action.Push
                title="Edit Model"
                icon={Icon.Pencil}
                shortcut={{ modifiers: ["cmd"], key: "e" }}
                target={<ModelForm models={models} currentModel={model} />}
              />
              <Action
                title={`${model.favorited ? "Remove From Favorites" : "Add To Favorites"}`}
                icon={model.favorited ? Icon.StarDisabled : Icon.Star}
                shortcut={{ modifiers: ["cmd"], key: "f" }}
                onAction={async () => {
                  await models.updateModel(model, { ...model, favorited: !model.favorited });
                  await models.revalidate();
                }}
              />
              <Action
                title={`${model.isDefault ? "Remove As Default" : "Set As Default"}`}
                icon={model.isDefault ? Icon.XMarkCircle : Icon.CheckCircle}
                shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
                onAction={async () => {
                  await models.updateModel(model, { ...model, isDefault: !model.isDefault });
                  for (const otherModel of models.models) {
                    if (otherModel.id != model.id) {
                      await models.updateModel(otherModel, { ...otherModel, isDefault: false });
                    }
                  }
                  await models.revalidate();
                }}
              />
              <Action.CopyToClipboard
                title="Copy Model JSON"
                content={(() => {
                  const key = `--model-${model.name}`;
                  const value: { [key: string]: Model } = {};
                  value[key] = { ...model, id: "", apiKey: "" };
                  return JSON.stringify(value);
                })()}
                shortcut={{ modifiers: ["cmd", "shift"], key: "j" }}
              />
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
              <Action
                title="Create Derivative"
                icon={Icon.EyeDropper}
                shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                onAction={async () => {
                  const newModel = await models.createModel({
                    ...model,
                    name: `${model.name} Copy`,
                    isDefault: false,
                    favorited: false,
                  });
                  await models.revalidate();
                  if (newModel) {
                    push(<ModelForm models={models} currentModel={newModel} duplicate={true} />);
                  }
                }}
              />
              <Action
                title="Delete Model"
                icon={Icon.Trash}
                shortcut={{ modifiers: ["cmd"], key: "d" }}
                style={Action.Style.Destructive}
                onAction={async () => {
                  if (
                    await confirmAlert({
                      title: "Delete Model?",
                      message: "Are you sure?",
                      primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
                    })
                  ) {
                    await models.deleteModel(model);
                    await models.revalidate();
                  }
                  await showToast({ title: `Deleted Model`, message: model.name });
                }}
              />
              <Action
                title="Delete All Models"
                icon={Icon.Trash}
                shortcut={{ modifiers: ["cmd", "opt"], key: "d" }}
                style={Action.Style.Destructive}
                onAction={async () => {
                  if (
                    await confirmAlert({
                      title: `Delete ${models.models.length} Models?`,
                      message: "Are you sure?",
                      primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
                    })
                  ) {
                    const totalAmount = models.models.length;
                    for (const model of models.models) {
                      await models.deleteModel(model);
                      await models.revalidate();
                    }
                    await showToast({ title: `Deleted ${totalAmount} Models` });
                  }
                }}
              />
            </ActionPanel.Section>
            {environment.isDevelopment ? (
              <ActionPanel.Section title="Development Actions">{null}</ActionPanel.Section>
            ) : null}
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
