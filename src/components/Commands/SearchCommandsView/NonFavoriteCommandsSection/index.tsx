import { List } from "@raycast/api";
import CommandListItem from "../CommandListItem";
import { Command } from "../../../../lib/commands/types";
import { useAdvancedSettingsContext } from "../../../../lib/contexts/settings";

type NonFavoriteCommandsSectionProps = {
  /**
   * The list of non-favorited commands.
   */
  nonfavoriteCommands: Command[];

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
 * A list section containing non-favorited commands.
 * @returns A {@link List.Section} component.
 */
export default function NonFavoriteCommandsSection(props: NonFavoriteCommandsSectionProps) {
  const { nonfavoriteCommands, previousCommand, visible } = props;
  const { advancedSettings } = useAdvancedSettingsContext();

  if (!visible) {
    return null;
  }

  return (
    <List.Section title={nonfavoriteCommands.length ? `Other Commands` : `All Commands`}>
      {nonfavoriteCommands.map((command) => (
        <CommandListItem command={command} previousCommand={previousCommand} settings={advancedSettings} />
      ))}
    </List.Section>
  );
}
