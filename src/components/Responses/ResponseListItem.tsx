/**
 * @file ResponseListItem.tsx
 *
 * @summary List item for saved responses for use in the 'Saved Responses' command of PromptLab.
 * @author Stephen Kaplan <skaplanofficial@gmail.com>
 *
 * Created at     : 2023-07-05 08:19:05
 * Last modified  : yyyy-07-dd 08:20:22
 */

import { Color, Icon, List } from "@raycast/api";

import { defaultAdvancedSettings } from "../../data/default-advanced-settings";
import { mapStringToColor } from "../../utils/command-utils";
import { SavedResponse } from "../../utils/types";
import SavedResponseActionPanel from "./actions/SavedResponseActionPanel";

/**
 * Saved response list item.
 * @param props.response The currently selected saved response.
 * @param props.savedResponses The list of all saved responses.
 * @param props.setSavedResponses The function to update the list of saved responses.
 * @param props.selectedTag The currently selected tag.
 * @param props.setSelectedTag The function to update the selected tag.
 * @param props.selectedKeyword The currently selected keyword.
 * @param props.setSelectedKeyword The function to update the selected keyword.
 * @param props.advancedSettings The advanced settings object.
 * @returns A list item component.
 */
export default function ResponseListItem(props: {
  response: SavedResponse;
  savedResponses: SavedResponse[];
  setSavedResponses: React.Dispatch<React.SetStateAction<SavedResponse[]>>;
  selectedTag: string;
  setSelectedTag: React.Dispatch<React.SetStateAction<string>>;
  selectedKeyword: string;
  setSelectedKeyword: React.Dispatch<React.SetStateAction<string>>;
  advancedSettings: typeof defaultAdvancedSettings;
}) {
  const {
    response,
    savedResponses,
    setSavedResponses,
    selectedTag,
    setSelectedTag,
    selectedKeyword,
    setSelectedKeyword,
    advancedSettings,
  } = props;
  return (
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
              <List.Item.Detail.Metadata.Label title="Date Saved" text={new Date(response.date).toString()} />
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
                        if (selectedKeyword == keyword) {
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
        <SavedResponseActionPanel
          response={response}
          savedResponses={savedResponses}
          setSavedResponses={setSavedResponses}
          advancedSettings={advancedSettings}
        />
      }
    />
  );
}
