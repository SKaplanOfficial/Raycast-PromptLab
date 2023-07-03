import { Action, ActionPanel, Form, Toast, environment, showToast, useNavigation } from "@raycast/api";
import { SavedResponse } from "../../utils/types";
import * as fs from "fs";
import path from "path";

/**
 * Form for adjusting the settings of a saved response.
 * @param props.response The response to edit.
 * @param props.setSavedResponses The function to update the saved responses list.
 * @returns A form component.
 */
export default function ResponseForm(props: {
  response: SavedResponse;
  setSavedResponses: React.Dispatch<React.SetStateAction<SavedResponse[]>>;
}) {
  const { response, setSavedResponses } = props;
  const { pop } = useNavigation();

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save"
            onSubmit={async (values) => {
              const newResponse = {
                ...response,
                name: values.name,
                tags: values.tags
                  .split(",")
                  .map((t: string) => t.trim())
                  .filter((t: string) => t.length > 0),
                favorited: values.favorited,
              };

              setSavedResponses((responses) => {
                const index = responses.findIndex((r) => r.id === response.id);
                responses[index] = newResponse;
                return responses;
              });

              const savedResponsesDir = path.join(environment.supportPath, "saved-responses");
              const savedResponsePath = path.join(savedResponsesDir, `${response.id}.json`);
              try {
                await fs.promises.writeFile(savedResponsePath, JSON.stringify(newResponse));
                await showToast({ title: "Saved Response Settings" });
              } catch (error) {
                console.error(error);
                await showToast({ title: "Error Saving Response Settings", style: Toast.Style.Failure });
              }
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Name" defaultValue={response.name} />
      <Form.TextField
        id="tags"
        title="Tags"
        defaultValue={response.tags.join(", ")}
        info="Comma separated list of tags"
      />
      <Form.Checkbox
        id="favorited"
        label="Favorite"
        defaultValue={response.favorited}
        info="Mark this response as a favorite"
      />
    </Form>
  );
}
