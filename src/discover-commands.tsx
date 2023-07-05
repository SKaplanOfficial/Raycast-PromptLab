import { Color, Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { StoreCommand } from "./utils/types";
import { useCachedState, useFetch } from "@raycast/utils";
import { STORE_ENDPOINT, STORE_KEY } from "./utils/constants";
import CategoryDropdown from "./components/CategoryDropdown";
import { useCommands } from "./hooks/useCommands";
import CommandListDetail from "./components/Commands/CommandListDetail";
import { useAdvancedSettings } from "./hooks/useAdvancedSettings";
import CommandActionPanel from "./components/Commands/actions/CommandActionPanel";

export default function Discover() {
  const {
    commands: myCommands,
    setCommands: setMyCommands,
    setTemplates,
    isLoading: loadingMyCommands,
  } = useCommands();
  const [availableCommands, setAvailableCommands] = useCachedState<StoreCommand[]>("--available-commands", []);
  const [targetCategory, setTargetCategory] = useState<string>("All");
  const { advancedSettings } = useAdvancedSettings();

  // Get available commands from store
  const { data, isLoading } = useFetch(STORE_ENDPOINT, { headers: { "X-API-KEY": STORE_KEY } });
  useEffect(() => {
    if (data && !isLoading) {
      setAvailableCommands((data as { data: StoreCommand[] })["data"].reverse());
    }
  }, [data, isLoading]);

  const knownPrompts = myCommands?.map((command) => command.prompt);

  const listItems = availableCommands
    .filter((command) => command.categories?.split(", ").includes(targetCategory) || targetCategory == "All")
    .map((command) => (
      <List.Item
        title={command.name}
        icon={{
          source: command.icon,
          tintColor: command.iconColor == undefined ? Color.PrimaryText : command.iconColor,
        }}
        key={command.name}
        accessories={
          knownPrompts?.includes(command.prompt) ? [{ icon: { source: Icon.CheckCircle, tintColor: Color.Green } }] : []
        }
        detail={<CommandListDetail command={command} />}
        actions={
          <CommandActionPanel
            command={command}
            commands={myCommands}
            setCommands={setMyCommands}
            availableCommands={availableCommands}
            setTemplates={setTemplates}
            settings={advancedSettings}
          />
        }
      />
    ));

  return (
    <List
      isLoading={loadingMyCommands || isLoading}
      isShowingDetail={availableCommands != undefined}
      searchBarPlaceholder="Search PromptLab store..."
      searchBarAccessory={<CategoryDropdown onSelection={setTargetCategory} />}
    >
      <List.EmptyView title="Loading..." icon={{ source: "no-view.png" }} />
      {targetCategory == "All" ? <List.Section title="Newest Commands">{listItems.slice(0, 5)}</List.Section> : null}
      <List.Section title="————————————————————">{listItems.slice(targetCategory == "All" ? 5 : 0)}</List.Section>
    </List>
  );
}
