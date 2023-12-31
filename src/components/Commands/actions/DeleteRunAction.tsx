import { Action, Alert, Icon, confirmAlert } from "@raycast/api";
import { Command, PLCommandRunProperties } from "../../../lib/commands/types";
import { getActionShortcut, isActionEnabled } from "../../../lib/action-utils";
import { AdvancedSettings } from "../../../data/default-advanced-settings";
import { updateCommand } from "../../../lib/commands/command-utils";

type DeleteRunActionProps = {
  /**
   * The run to delete.
   */
  run: PLCommandRunProperties;

  /**
   * Function to update the list of runs.
   */
  setRuns: React.Dispatch<React.SetStateAction<PLCommandRunProperties[]>>;

  /**
   * The command to update.
   */
  command: Command;

  /**
   * Function to update the list of commands.
   */
  setCommands: React.Dispatch<React.SetStateAction<Command[]>>;

  /**
   * The user's advanced settings.
   */
  settings: AdvancedSettings;
};

/**
 * Action to delete a record for a previous run of a command.
 * @returns {JSX.Element} An Action component, or null if the action is disabled.
 */
export default function DeleteRunAction(props: DeleteRunActionProps): JSX.Element | null {
  const { run, setRuns, command, setCommands, settings } = props;

  if (!isActionEnabled("DeleteRunAction", settings)) {
    return null;
  }

  return (
    <Action
      title="Delete Run"
      icon={Icon.Trash}
      style={Action.Style.Destructive}
      shortcut={getActionShortcut("DeleteRunAction", settings)}
      onAction={async () => {
        if (
          await confirmAlert({
            title: "Delete Run",
            message: "Are you sure?",
            primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
          })
        ) {
          const updatedCommand = {
            ...command,
            runs: command.runs?.filter((item) => item.id !== run.id) || [],
          };
          await updateCommand(command, updatedCommand, setCommands);
          setRuns(updatedCommand.runs);
        }
      }}
    />
  );
}
