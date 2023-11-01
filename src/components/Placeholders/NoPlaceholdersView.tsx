import { Icon, List } from "@raycast/api";

/**
 * View to show when there are no placeholders to display.
 * @param props.totalCount The total number of placeholders.
 * @returns An action component.
 */
export default function NoPlaceholdersView(props: {
  totalCount: number;
}) {
  const { totalCount } = props;

  if (totalCount == 0) {
    return (<List.EmptyView title="No custom placeholders yet, add one to get started." icon={Icon.PlusCircle} />)
  }
  
  return (<List.EmptyView title="No matching placeholders found." icon={Icon.XMarkCircle} />)
}
