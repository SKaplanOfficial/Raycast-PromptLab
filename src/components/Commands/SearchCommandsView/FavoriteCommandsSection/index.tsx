import { List } from "@raycast/api";
import CommandListItem from "../CommandListItem";
import { Command } from "../../../../lib/commands/types";
import { useAdvancedSettingsContext } from "../../../../lib/contexts/settings";

type FavoriteCommandsSectionProps = {
  /**
   * The list of favorited commands.
   */
  favoriteCommands: Command[];

  /**
   * The name of the previously executed command.
   */
  previousCommand: string;

  /**
   * Whether the section is currently visible.
   */
  visible: boolean;
};

/**
 * A list section containing favorited commands.
 * @returns A {@link List.Section} component.
 */
export default function FavoriteCommandsSection(props: FavoriteCommandsSectionProps) {
  const { favoriteCommands, previousCommand, visible } = props;
  const { advancedSettings } = useAdvancedSettingsContext();

  if (!visible) {
    return null;
  }

  return (
    <List.Section title="Favorites">
      {favoriteCommands.map((command) => (
        <CommandListItem command={command} previousCommand={previousCommand} settings={advancedSettings} />
      ))}
    </List.Section>
  );
}
