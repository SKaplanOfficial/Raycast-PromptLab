import SearchCommandsView from "./components/Commands/SearchCommandsView";
import CommandListContext, { useCommandListContextState } from "./lib/contexts/commands";
import AdvancedSettingsContext, { useAdvancedSettingsContextState } from "./lib/contexts/settings";

export default function SearchCommand(props: { arguments: { commandName: string; queryInput: string } }) {
  const { commandName, queryInput } = props.arguments;
  const commandListContext = useCommandListContextState();
  const advancedSettingsContext = useAdvancedSettingsContextState();

  return (
    <CommandListContext.Provider value={commandListContext}>
      <AdvancedSettingsContext.Provider value={advancedSettingsContext}>
        <SearchCommandsView commandName={commandName} queryInput={queryInput} />
      </AdvancedSettingsContext.Provider>
    </CommandListContext.Provider>
  );
}
