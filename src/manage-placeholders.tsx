import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useAdvancedSettings } from "./hooks/useAdvancedSettings";
import { useCustomPlaceholders } from "./hooks/useCustomPlaceholders";
import { deleteCustomPlaceholder } from "./utils/placeholders";

export default function ManagePlaceholders() {
  const { customPlaceholders, isLoading, revalidate } = useCustomPlaceholders();
  const { advancedSettings } = useAdvancedSettings();

  const listItems = Object.entries(customPlaceholders).map(([key, customPlaceholder]) => {
    return (
      <List.Item
        title={customPlaceholder.name}
        subtitle={customPlaceholder.description}
        key={key}
        accessories={[
          {
            icon: Icon.Document,
            tooltip: `Source: ${customPlaceholder.source}`,
          },
        ]}
        actions={
          <ActionPanel>
            <Action
              title="Delete Placeholder"
              icon={Icon.Trash}
              shortcut={{ modifiers: ["cmd"], key: "d" }}
              onAction={async () => {
                await deleteCustomPlaceholder(key, customPlaceholder);
                await revalidate();
              }}
              style={Action.Style.Destructive}
            />
          </ActionPanel>
        }
      />
    );
  });

  return (
    <List
      isLoading={isLoading}
      actions={
        <ActionPanel>
          {/* <Action.Push
            title="Add New Model"
            icon={Icon.PlusCircle}
            shortcut={{ modifiers: ["cmd"], key: "n" }}
            target={<ModelForm models={models} />}
          /> */}
        </ActionPanel>
      }
    >
      <List.EmptyView title="No custom placeholders yet, add one to get started." icon={Icon.PlusCircle} />
      {listItems}
    </List>
  );
}
