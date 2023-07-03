import { ActionPanel, Color, Icon, List } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import { SavedResponse } from "./utils/types";
import { StorageKeys } from "./utils/constants";
import { useEffect, useState } from "react";
import { loadSavedResponses, mapStringToColor } from "./utils/command-utils";
import ResponseFilterDropdown from "./components/Responses/ResponseFilterDropdown";
import DeleteAllSavedResponsesAction from "./components/Responses/actions/DeleteAllSavedResponsesAction";
import { useAdvancedSettings } from "./hooks/useAdvancedSettings";
import DeleteSavedResponseAction from "./components/Responses/actions/DeleteSavedResponseAction";
import ToggleFavoriteSavedResponseAction from "./components/Responses/actions/ToggleFavoriteSavedResponseAction";
import EditSavedResponseAction from "./components/Responses/actions/EditSavedResponseAction";
import { AdvancedActionSubmenu } from "./components/actions/AdvancedActionSubmenu";
import CopyIDAction from "./components/actions/CopyIDAction";

export default function SavedResponses() {
  const [savedResponses, setSavedResponses] = useCachedState<SavedResponse[]>(StorageKeys.SAVED_RESPONSES, []);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedKeyword, setSelectedKeyword] = useState<string>("");
  const { advancedSettings } = useAdvancedSettings();

  useEffect(() => {
    Promise.resolve(loadSavedResponses()).then((responses) => {
      setSavedResponses(responses);
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
          <List.Item
            key={response.id}
            title={response.name}
            icon={response.favorited ? { source: Icon.StarCircle, tintColor: Color.Yellow } : undefined}
            keywords={[...response.tags, ...response.keywords, response.id]}
            detail={
              <List.Item.Detail
                markdown={`# ${response.name}
          
**Response:**
\`\`\`
${response.response}
\`\`\`

**From Prompt:**
\`\`\`
${response.prompt}
\`\`\`

**Base Prompt:**
\`\`\`
${response.rawPrompt}
\`\`\`

_Response ID: ${response.id}_`}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Date" text={new Date(response.date).toString()} />
                    <List.Item.Detail.Metadata.Label title="Command" text={response.commandName} />
                    <List.Item.Detail.Metadata.Label title="Launch Source" text={response.launchSource} />
                    {response.tags.length > 0 ? (
                      <List.Item.Detail.Metadata.TagList title="Tags">
                        {response.tags.map((tag) => (
                          <List.Item.Detail.Metadata.TagList.Item
                            key={tag}
                            text={tag}
                            color={mapStringToColor(tag)}
                            onAction={() => {
                              if (selectedTag == tag) {
                                setSelectedTag("");
                              } else {
                                setSelectedTag(tag);
                              }
                            }}
                          />
                        ))}
                      </List.Item.Detail.Metadata.TagList>
                    ) : null}
                    {response.keywords.length > 0 ? (
                      <List.Item.Detail.Metadata.TagList title="Keywords">
                        {response.keywords.map((keyword) => (
                          <List.Item.Detail.Metadata.TagList.Item
                            key={keyword}
                            text={keyword}
                            color={mapStringToColor(keyword)}
                            onAction={() => {
                              if (selectedTag == keyword) {
                                setSelectedKeyword("");
                              } else {
                                setSelectedKeyword(keyword);
                              }
                            }}
                          />
                        ))}
                      </List.Item.Detail.Metadata.TagList>
                    ) : null}
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                <EditSavedResponseAction
                  response={response}
                  setSavedResponses={setSavedResponses}
                  settings={advancedSettings}
                />
                <ToggleFavoriteSavedResponseAction
                  response={response}
                  savedResponses={savedResponses}
                  setSavedResponses={setSavedResponses}
                  settings={advancedSettings}
                />
                <CopyIDAction id={response.id} objectType="Saved Response" settings={advancedSettings} />
                <DeleteSavedResponseAction
                  response={response}
                  savedResponses={savedResponses}
                  setSavedResponses={setSavedResponses}
                  settings={advancedSettings}
                />
                <DeleteAllSavedResponsesAction
                  savedResponses={savedResponses}
                  setSavedResponses={setSavedResponses}
                  settings={advancedSettings}
                />
                <AdvancedActionSubmenu settings={advancedSettings} />
              </ActionPanel>
            }
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
        icon={Icon.SaveDocument}
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
