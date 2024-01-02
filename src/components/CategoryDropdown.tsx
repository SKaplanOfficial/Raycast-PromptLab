import { List } from "@raycast/api";
import { COMMAND_CATEGORIES } from "../lib/constants";

type CategoryDropdownProps = {
  /**
   * Whether the parent list component is loading. If true, the dropdown will not be rendered.
   */
  isLoading: boolean;

  /**
   * The callback to invoke when a new category is selected.
   */
  onSelection: (newValue: string) => void;
};

/**
 * The dropdown component for selecting a focused command category in the 'My PromptLab Commands' command.
 * @returns A {@link List.Dropdown} component, or null if the parent list is loading.
 */
export default function CategoryDropdown(props: CategoryDropdownProps) {
  const {isLoading, onSelection } = props;

  if (isLoading) {
    return null;
  }

  return (
    <List.Dropdown
      tooltip="Select Command Category"
      storeValue={true}
      onChange={(newValue) => {
        onSelection(newValue);
      }}
    >
      <List.Dropdown.Item key="All" title="All" value="All" />
      {COMMAND_CATEGORIES.map((category) => (
        <List.Dropdown.Item
          key={category.name}
          title={category.name}
          value={category.name}
          icon={{ source: category.icon, tintColor: category.color }}
        />
      ))}
    </List.Dropdown>
  );
}
