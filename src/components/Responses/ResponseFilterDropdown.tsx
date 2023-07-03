import { Icon, List } from "@raycast/api";
import { SavedResponse } from "../../utils/types";
import { mapStringToColor } from "../../utils/command-utils";

export default function ResponseFilterDropdown(props: {
  savedResponses: SavedResponse[];
  selectedTag: string;
  selectedKeyword: string;
  setSelectedTag: React.Dispatch<React.SetStateAction<string>>;
  setSelectedKeyword: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { savedResponses, selectedTag, selectedKeyword, setSelectedTag, setSelectedKeyword } = props;

  const tags = savedResponses.flatMap((response) => response.tags);
  const keywords = savedResponses.flatMap((response) => response.keywords);

  return (
    <List.Dropdown
      tooltip="Filter by tag or keyword"
      storeValue={true}
      value={selectedTag || selectedKeyword || "All"}
      onChange={(value) => {
        if (value == "All") {
          setSelectedTag("");
          setSelectedKeyword("");
        } else if (tags.includes(value)) {
          setSelectedTag(value);
          setSelectedKeyword("");
        } else if (keywords.includes(value)) {
          setSelectedTag("");
          setSelectedKeyword(value);
        }
      }}
    >
      <List.Dropdown.Item key="All" title="All" value="All" icon={Icon.Circle} />

      <List.Dropdown.Section title="Tags">
        {tags.map((tag) => (
          <List.Dropdown.Item
            key={tag}
            title={tag}
            value={tag}
            icon={{ source: Icon.Tag, tintColor: mapStringToColor(tag) }}
          />
        ))}
      </List.Dropdown.Section>

      <List.Dropdown.Section title="Keywords">
        {keywords.map((keyword) => (
          <List.Dropdown.Item
            key={keyword}
            title={keyword}
            value={keyword}
            icon={{ source: Icon.Key, tintColor: mapStringToColor(keyword) }}
          />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}
