import {
  Action,
  ActionPanel,
  Form,
  showToast,
  Icon,
  LocalStorage,
  useNavigation,
  Color,
  environment,
  Toast,
  AI,
} from "@raycast/api";
import { Chat } from "../utils/types";
import { useState } from "react";
import * as fs from "fs";
import { getTextOfWebpage } from "../utils/context-utils";
import { filterString } from "../utils/calendar-utils";

interface ChatSettingsFormValues {
  chatNameField: string;
  chatIconField: string;
  chatIconColorField: string;
  chatBasePromptField: string;
  chatFavoritedField: boolean;
  [key: string]: string[] | string | boolean;
}

export default function ChatSettingsForm(props: {
  oldData?: Chat;
  chats: string[];
  setChats: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
  setChatSettings: React.Dispatch<React.SetStateAction<Chat[]>>;
  setCurrentChatSettings: React.Dispatch<React.SetStateAction<Chat | undefined>>;
}) {
  const { oldData, chats, setChats, setSelectedChat, setChatSettings, setCurrentChatSettings } = props;
  const [contextFields, setContextFields] = useState<{ type: string; source: string; data: string }[]>(
    oldData ? oldData.contextData : []
  );
  const { pop } = useNavigation();

  const supportPath = environment.supportPath;
  const chatsDir = `${supportPath}/chats`;

  return (
    <Form
      navigationTitle="Chat Settings"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Chat Settings"
            onSubmit={async (values: ChatSettingsFormValues) => {
              const toast = await showToast({
                title: "Saving Chat Settings",
                message: "This could take a minute...",
                style: Toast.Style.Animated,
              });

              const filledContextFields = [...contextFields.map((field) => ({ ...field }))];
              for (let i = 0; i < contextFields.length; i++) {
                const contextField = contextFields[i];
                const contextDataFieldRaw = values[`contextDataField${i}`];
                const contextDataField = Array.isArray(contextDataFieldRaw)
                  ? (contextDataFieldRaw[0] as string)
                  : (contextDataFieldRaw as string);
                if (contextDataField.length) {
                  if (oldData && oldData.contextData.length > i && oldData.contextData[i].source == contextDataField) {
                    // If the context data field hasn't changed, don't re-summarize it
                    continue;
                  }

                  let prompt = "";
                  let condensedText = "";
                  switch (contextField.type) {
                    case "website": {
                      prompt = `Summarize the following text of ${contextDataField} in 50 words or fewer: `;
                      const websiteText = filterString(await getTextOfWebpage(contextDataField));
                      condensedText = await AI.ask(`${prompt} ###${websiteText}###`);
                      filledContextFields[i].source = contextDataField;
                      filledContextFields[i].data = condensedText.trim();
                      break;
                    }
                    case "file": {
                      prompt = `Summarize this file in 100 words or fewer: `;
                      const fileText = filterString(fs.readFileSync(contextDataField, "utf8"));
                      condensedText = await AI.ask(`${prompt} ###${fileText}###`);
                      filledContextFields[i].source = contextDataField;
                      filledContextFields[i].data = condensedText.trim();
                      break;
                    }
                    case "folder": {
                      prompt = `Summarize the contents of the following folder in 50 words or fewer. What is the purpose of the folder? What is each file for? `;
                      const folderText = filterString(fs.readdirSync(contextDataField).join(", "));
                      condensedText = await AI.ask(`${prompt} ###${folderText}###`);
                      filledContextFields[i].source = contextDataField;
                      filledContextFields[i].data = condensedText.trim();
                      break;
                    }
                    case "text": {
                      prompt = `Summarize the following text in 50 words or fewer: `;
                      condensedText = await AI.ask(`${prompt} ###${filterString(contextDataField)}$$$`);
                      filledContextFields[i].source = contextDataField;
                      filledContextFields[i].data = condensedText.trim();
                      break;
                    }
                  }
                } else {
                  filledContextFields[i].data = "";
                }
              }

              const newChat: Chat = {
                name: values.chatNameField,
                icon: values.chatIconField,
                iconColor: values.chatIconColorField,
                basePrompt: values.chatBasePromptField,
                favorited: values.chatFavoritedField,
                contextData: filledContextFields.filter((field) => field.data.length > 0),
              };

              // Delete the existing chat if it exists
              const filteredChats = [...chats];
              if (oldData) {
                await LocalStorage.removeItem(`--chat-${oldData.name}`);
                filteredChats.splice(filteredChats.indexOf(oldData.name), 1);
              }

              // Add the new chat
              await LocalStorage.setItem(`--chat-${values.chatNameField}`, JSON.stringify(newChat));

              // Update the list of chats
              setChatSettings(
                Object.entries(await LocalStorage.allItems())
                  .filter(([key]) => key.startsWith("--chat-"))
                  .map(([, value]) => JSON.parse(value))
              );

              let fileContent = "";
              if (oldData && oldData.name != newChat.name) {
                const oldChatFile = `${chatsDir}/${oldData.name}.txt`;
                fileContent = fs.readFileSync(oldChatFile, "utf8");
                fs.unlinkSync(oldChatFile);
              }

              if (!oldData || oldData.name != newChat.name) {
                const newChatFile = `${chatsDir}/${newChat.name}.txt`;
                fs.writeFileSync(newChatFile, fileContent);
              }

              const newChats = [...filteredChats, newChat.name];
              setChats(newChats);
              setSelectedChat(newChat.name);
              setCurrentChatSettings(newChat);

              toast.title = "Chat Settings Saved";
              toast.message = "";
              toast.style = Toast.Style.Success;

              pop();
            }}
          />
          <Action
            title="Add Website Context"
            icon={Icon.Globe}
            onAction={() => {
              setContextFields([...contextFields, { type: "website", source: "", data: "" }]);
            }}
          />
          <Action
            title="Add File Context"
            icon={Icon.Document}
            onAction={() => {
              setContextFields([...contextFields, { type: "file", source: "", data: "" }]);
            }}
          />
          <Action
            title="Add Folder Context"
            icon={Icon.Folder}
            onAction={() => {
              setContextFields([...contextFields, { type: "folder", source: "", data: "" }]);
            }}
          />
          <Action
            title="Add Text Context"
            icon={Icon.TextInput}
            onAction={() => {
              setContextFields([...contextFields, { type: "text", source: "", data: "" }]);
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        title="Chat Name"
        placeholder="Name for this chat"
        defaultValue={oldData ? oldData.name : ""}
        id="chatNameField"
      />

      <Form.Dropdown title="Icon" defaultValue={oldData ? oldData.icon : undefined} id="chatIconField">
        {Object.keys(Icon).map((iconName, index) => (
          <Form.Dropdown.Item
            title={iconName}
            value={Object.values(Icon)[index]}
            key={iconName}
            icon={Object.values(Icon)[index]}
          />
        ))}
      </Form.Dropdown>

      <Form.Dropdown title="Icon Color" defaultValue={oldData ? oldData.iconColor : undefined} id="chatIconColorField">
        <Form.Dropdown.Item
          title={environment.theme == "dark" ? "White" : "Black"}
          value={Color.PrimaryText}
          icon={{ source: Icon.CircleFilled, tintColor: Color.PrimaryText }}
        />
        <Form.Dropdown.Item title="Red" value={Color.Red} icon={{ source: Icon.CircleFilled, tintColor: Color.Red }} />
        <Form.Dropdown.Item
          title="Orange"
          value={Color.Orange}
          icon={{ source: Icon.CircleFilled, tintColor: Color.Orange }}
        />
        <Form.Dropdown.Item
          title="Yellow"
          value={Color.Yellow}
          icon={{ source: Icon.CircleFilled, tintColor: Color.Yellow }}
        />
        <Form.Dropdown.Item
          title="Green"
          value={Color.Green}
          icon={{ source: Icon.CircleFilled, tintColor: Color.Green }}
        />
        <Form.Dropdown.Item
          title="Blue"
          value={Color.Blue}
          icon={{ source: Icon.CircleFilled, tintColor: Color.Blue }}
        />
        <Form.Dropdown.Item
          title="Purple"
          value={Color.Purple}
          icon={{ source: Icon.CircleFilled, tintColor: Color.Purple }}
        />
        <Form.Dropdown.Item
          title="Magenta"
          value={Color.Magenta}
          icon={{ source: Icon.CircleFilled, tintColor: Color.Magenta }}
        />
      </Form.Dropdown>

      <Form.TextField
        title="Base Prompt"
        placeholder="Context prompt for all queries"
        info="A context prompt provided to the model endpoint alongside all queries. This maintains context throughout the conversation."
        defaultValue={oldData ? oldData.basePrompt : ""}
        id="chatBasePromptField"
      />

      <Form.Checkbox label="Favorite" defaultValue={oldData ? oldData.favorited : false} id="chatFavoritedField" />

      <Form.Separator />

      <Form.Description
        title="Context Data"
        text="Context data is always maintained in the conversation history. The data is minimize such that it fits within the configured token limit. To add context data, use one of the actions from the Actions menu to add additional fields to this form."
      />

      {contextFields.map((field, index) => {
        switch (field.type) {
          case "website":
            return (
              <Form.TextField
                title="Website URL"
                id={`contextDataField${index}`}
                key={`contextDataField${index}`}
                placeholder="https://www.example.com"
                info="The URL of the website to use as context. The URL, title, and text of the website will be used as the context data."
                defaultValue={oldData && oldData.contextData.length > index ? oldData.contextData[index].source : ""}
              />
            );
          case "file":
            return (
              <Form.FilePicker
                title="File Path"
                id={`contextDataField${index}`}
                key={`contextDataField${index}`}
                allowMultipleSelection={false}
                info="The path to the file to use as context. The contents of the file will be used as the context data."
                defaultValue={oldData && oldData.contextData.length > index ? [oldData.contextData[index].source] : []}
              />
            );
          case "folder":
            return (
              <Form.FilePicker
                title="Folder Path"
                id={`contextDataField${index}`}
                key={`contextDataField${index}`}
                allowMultipleSelection={false}
                canChooseDirectories={true}
                canChooseFiles={false}
                info="The path to the folder to use as context. A description of the contents of the folder will be used as the context data."
                defaultValue={oldData && oldData.contextData.length > index ? [oldData.contextData[index].source] : []}
              />
            );
          case "text":
            return (
              <Form.TextField
                title="Text"
                id={`contextDataField${index}`}
                key={`contextDataField${index}`}
                placeholder="Some text"
                info="Raw text to use as context data."
                defaultValue={oldData && oldData.contextData.length > index ? oldData.contextData[index].source : ""}
              />
            );
        }
      })}
    </Form>
  );
}
