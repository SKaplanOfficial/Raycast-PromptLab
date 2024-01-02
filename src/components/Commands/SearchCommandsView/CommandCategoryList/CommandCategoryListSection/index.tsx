import { List } from "@raycast/api";
import { Command } from "../../../../../lib/commands/types";
import { CommandCategory } from "../../../../../lib/types";
import CommandListItem from "../../CommandListItem";
import { useAdvancedSettingsContext } from "../../../../../lib/contexts/settings";

type CommandCategoryListSectionProps = {
  /**
   * The command category to display.
   */
  category: CommandCategory;

  /**
   * The list of commands in the category.
   */
  commandsInCategory: Command[];
};

/**
 * A list section containing commands in a specific category.
 * @returns A {@link List.Section} component.
 */
export default function CommandCategoryListSection(props: CommandCategoryListSectionProps) {
  const { category, commandsInCategory } = props;
  const { advancedSettings } = useAdvancedSettingsContext();

  return (
    <List.Section title={category.name} key={category.name}>
      {commandsInCategory.map((command) => (
        <CommandListItem command={command} previousCommand={""} settings={advancedSettings} />
      ))}
    </List.Section>
  );
}
