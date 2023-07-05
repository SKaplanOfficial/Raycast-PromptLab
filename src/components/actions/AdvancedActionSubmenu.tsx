import { ActionPanel, Icon } from "@raycast/api";

import { defaultAdvancedSettings } from "../../data/default-advanced-settings";
import {
  EditCustomPlaceholdersAction,
  OpenAdvancedSettingsAction,
  OpenPlaceholdersGuideAction,
} from "./OpenFileActions";

/**
 * Submenu for advanced actions.
 * @param props.settings The advanced settings object.
 * @returns {JSX.Element} The action component.
 */
export default function AdvancedActionSubmenu(props: { settings: typeof defaultAdvancedSettings }) {
  const { settings } = props;
  return (
    <ActionPanel.Submenu
      title="Advanced..."
      icon={Icon.CommandSymbol}
      shortcut={{ modifiers: ["cmd", "shift"], key: "a" }}
    >
      <EditCustomPlaceholdersAction settings={settings} />
      <OpenPlaceholdersGuideAction settings={settings} />
      <OpenAdvancedSettingsAction settings={settings} />
    </ActionPanel.Submenu>
  );
}
