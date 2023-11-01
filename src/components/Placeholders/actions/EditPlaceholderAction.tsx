import { Action, Icon, useNavigation } from "@raycast/api";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import { getActionShortcut, isActionEnabled } from "../../../utils/action-utils";
import { getCustomPlaceholder } from "../../../utils/placeholders";
import { Placeholder } from "../../../utils/types";
import CustomPlaceholderForm from "../CustomPlaceholderForm";

/**
 * Action to open the edit form for a custom placeholder.
 * @param props.settings The advanced settings object.
 * @param props.placeholderKey The key of the placeholder to edit.
 * @param props.placeholderData The placeholder data to edit.
 * @param props.revalidatePlaceholders A function to revalidate the custom placeholders.
 * @returns An action component.
 */
export default function EditPlaceholderAction(props: {
  settings: typeof defaultAdvancedSettings;
  placeholderKey?: string;
  placeholderData?: Placeholder;
  revalidatePlaceholders: () => Promise<void>
}) {
  const { settings, placeholderKey, placeholderData, revalidatePlaceholders } = props;
  const { push } = useNavigation();

  if (!isActionEnabled("EditAction", settings)) {
    return null;
  }

  return (
    <Action
      title={placeholderData == undefined ? `Create New Placeholder` : `Edit Placeholder`}
      icon={placeholderData == undefined ? Icon.PlusCircle : Icon.Pencil}
      shortcut={placeholderData == undefined ? getActionShortcut("CreatePlaceholderAction", settings) : getActionShortcut("EditAction", settings)}
      onAction={async () => {
        if (!placeholderKey || !placeholderData) {
          push(<CustomPlaceholderForm revalidate={revalidatePlaceholders} />)
          return;
        }
        const customPlaceholder = await getCustomPlaceholder(placeholderKey, placeholderData)
        push(<CustomPlaceholderForm revalidate={revalidatePlaceholders} oldData={[placeholderKey, customPlaceholder]} />)
      }}
    />
  );
}
