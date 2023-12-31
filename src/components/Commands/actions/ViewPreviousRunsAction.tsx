import { Action, Icon } from "@raycast/api";
import { Command } from "../../../lib/commands/types";
import CommandRunsList from "../CommandRunsList";
import { getActionShortcut, isActionEnabled } from "../../../lib/action-utils";
import { AdvancedSettings } from "../../../data/default-advanced-settings";

type ViewPreviousRunsActionProps = {
  /**
   * Hi
   */
  command: Command;
  setCommands: React.Dispatch<React.SetStateAction<Command[]>>;
  settings: AdvancedSettings;
};

/**
 * Action to view previous runs of a command.
 * @param props The action props.
 * @returns {JSX.Element} An Action.Push component, or null if the action is disabled.
 */
export default function ViewPreviousRunsAction(props: ViewPreviousRunsActionProps): JSX.Element | null {
  const { command, setCommands, settings } = props;

  if (!isActionEnabled("ViewPreviousRunsAction", settings)) {
    return null;
  }

  return (
    <Action.Push
      title="View Previous Runs"
      target={<CommandRunsList command={command} setCommands={setCommands} settings={settings} />}
      icon={Icon.Clock}
      shortcut={getActionShortcut("ViewPreviousRunsAction", settings)}
    />
  );
}
