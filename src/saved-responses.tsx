import { useEffect, useState } from "react";

import { ActionPanel, List } from "@raycast/api";
import { useCachedState } from "@raycast/utils";

import AdvancedActionSubmenu from "./components/actions/AdvancedActionSubmenu";
import ResponseFilterDropdown from "./components/Responses/ResponseFilterDropdown";
import { useAdvancedSettings } from "./hooks/useAdvancedSettings";
import { loadSavedResponses } from "./utils/command-utils";
import { STORAGE_KEYS } from "./utils/constants";
import { installDefaults } from "./utils/file-utils";
import { SavedResponse } from "./utils/types";
import ResponseListItem from "./components/Responses/ResponseListItem";

export default function SavedResponses() {
  const [savedResponses, setSavedResponses] = useCachedState<SavedResponse[]>(STORAGE_KEYS.SAVED_RESPONSES, []);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedKeyword, setSelectedKeyword] = useState<string>("");
  const { advancedSettings } = useAdvancedSettings();

  useEffect(() => {
    Promise.resolve(installDefaults()).then(() => {
      Promise.resolve(loadSavedResponses()).then((responses) => {
        setSavedResponses(responses);
      });
    });
  }, []);

  const listItems = savedResponses.reduce(
    (acc, response) => {
      if (selectedTag != "" && !response.tags.includes(selectedTag)) {
        return acc;
      } else if (
        selectedKeyword != "" &&
        !response.keywords.includes(selectedKeyword) &&
        !response.name.includes(selectedKeyword)
      ) {
        return acc;
      } else {
        const item = (
          <ResponseListItem
            key={response.id}
            response={response}
            savedResponses={savedResponses}
            setSavedResponses={setSavedResponses}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            selectedKeyword={selectedKeyword}
            setSelectedKeyword={setSelectedKeyword}
            advancedSettings={advancedSettings}
          />
        );

        if (response.favorited) {
          acc.favorites.push(item);
        } else {
          acc.others.push(item);
        }
        return acc;
      }
    },
    { favorites: [] as JSX.Element[], others: [] as JSX.Element[] }
  );

  return (
    <List
      searchBarPlaceholder="Search Saved Responses..."
      isShowingDetail={savedResponses.length > 0}
      searchBarAccessory={
        savedResponses.length > 0 ? (
          <ResponseFilterDropdown
            savedResponses={savedResponses}
            selectedTag={selectedTag}
            selectedKeyword={selectedKeyword}
            setSelectedTag={setSelectedTag}
            setSelectedKeyword={setSelectedKeyword}
          />
        ) : null
      }
      actions={
        <ActionPanel>
          <AdvancedActionSubmenu settings={advancedSettings} />
        </ActionPanel>
      }
    >
      <List.EmptyView
        title="No Saved Responses"
        description="Save a response to see it here."
        icon={{ source: "no-view.png" }}
      />

      {listItems.favorites.length > 0 ? (
        <List.Section
          title="Favorite Responses"
          subtitle={`${listItems.favorites.length} saved response${listItems.favorites.length == 1 ? "" : "s"}`}
        >
          {listItems.favorites}
        </List.Section>
      ) : null}

      {listItems.others.length > 0 && listItems.favorites.length > 0 ? (
        <List.Section
          title="Other Responses"
          subtitle={`${listItems.others.length} saved response${listItems.others.length == 1 ? "" : "s"}`}
        >
          {listItems.others}
        </List.Section>
      ) : listItems.others.length > 0 ? (
        listItems.others
      ) : null}
    </List>
  );
}
