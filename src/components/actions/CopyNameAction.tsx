import { Action, Clipboard, Icon, showToast } from "@raycast/api";
import { defaultAdvancedSettings } from "../../data/default-advanced-settings";
import { isActionEnabled } from "../../utils/action-utils";

/**
 * Base action to copy an object's name to the clipboard.
 * @param props.name The name to copy, or a function that returns the name.
 * @param props.objectType The type of object whose name is being copied.
 * @param props.settings The advanced settings object.
 * @returns An action component.
 */
export default function CopyNameAction(props: {
  name: string | (() => string) | (() => Promise<string>);
  objectType: string;
  settings: typeof defaultAdvancedSettings;
}) {
  const { name, objectType, settings } = props;

  if (!isActionEnabled("CopyNameAction", settings)) {
    return null;
  }

  return (
    <Action
      title={`Copy ${objectType} Name`}
      icon={Icon.CopyClipboard}
      onAction={async () => {
        let contentToCopy = "";
        if (typeof name == "function") {
          contentToCopy = await new Promise((resolve, reject) => {
            try {
              resolve(name());
            } catch (e) {
              reject(e);
            }
          });
        } else {
          contentToCopy = name;
        }
        await Clipboard.copy(contentToCopy);
        await showToast({ title: `Copied ${objectType} Name` })
      }}
      shortcut={{ modifiers: ["cmd", "shift"], key: "n" }}
    />
  );
}
