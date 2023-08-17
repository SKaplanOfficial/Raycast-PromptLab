import { Action, Clipboard, Icon, showToast } from "@raycast/api";
import { defaultAdvancedSettings } from "../../data/default-advanced-settings";
import { getActionShortcut, isActionEnabled } from "../../utils/action-utils";

/**
 * Base action to copy an object's JSON representation to the clipboard.
 * @param props.content The object to copy, or its JSON string representation.
 * @param props.objectType The type of object to copy.
 * @param props.settings The advanced settings object.
 * @returns An action component.
 */
export default function CopyJSONAction(props: {
  content: object | string | (() => string | object) | (() => Promise<string | object>);
  objectType: string;
  settings: typeof defaultAdvancedSettings;
}) {
  const { content, objectType, settings } = props;

  if (!isActionEnabled("CopyJSONAction", settings)) {
    return null;
  }

  return (
    <Action
      title={`Copy ${objectType} JSON`}
      icon={Icon.CopyClipboard}
      onAction={async () => {
        let contentToCopy = "";
        if (typeof content == "function") {
          contentToCopy = await new Promise((resolve, reject) => {
            try {
              resolve(content());
            } catch (e) {
              reject(e);
            }
          });
        } else if (content == "string") {
          contentToCopy = content;
        } else {
          contentToCopy = JSON.stringify(content);
        }
        await Clipboard.copy(contentToCopy);
        await showToast({ title: `Copied ${objectType} JSON` })
      }}
      shortcut={getActionShortcut("CopyJSONAction", settings)}
    />
  );
}
