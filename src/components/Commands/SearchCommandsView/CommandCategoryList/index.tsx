import { useCommandListContext } from "../../../../lib/contexts/commands";
import { CommandCategory } from "../../../../lib/types";
import CommandCategoryListSection from "./CommandCategoryListSection";

type CommandCategoryListProps = {
  /**
   * The list of categories to display.
   */
  visibleCategories: CommandCategory[];
};

/**
 * A list of command category list sections.
 * @returns A list of {@link CommandCategoryListSection} components.
 */
export default function CommandCategoryList(props: CommandCategoryListProps) {
  const { visibleCategories } = props;
  const { commandsMatchingCategory } = useCommandListContext();

  return visibleCategories.map((category) => {
    const commandsInCategory = commandsMatchingCategory(category);

    // Sort favorite commands to the top of each category
    const sortedCommandsInCategory = commandsInCategory
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => (a.favorited && !b.favorited ? -1 : 1));

    return <CommandCategoryListSection category={category} commandsInCategory={sortedCommandsInCategory} />;
  });
}
