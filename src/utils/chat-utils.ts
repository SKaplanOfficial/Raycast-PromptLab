import { LocalStorage } from "@raycast/api";
import runModel from "./runModel";
import { Chat, ChatManager } from "./types";

/**
 * Generates a chat name based on the query. Maximum three words, 25 characters.
 * @param query The query to generate a chat name from.
 * @returns A promise resolving to the generated chat name.
 */
export const generateTitle = async (query: string) => {
  const namePrompt =
    "Come up with a title, in Title Case, for a conversation started with the following query. The title must summarize the intent of the query. The title must be three words or shorter. Output only the title without commentary or labels. For example, if the query is 'What are galaxies?', the title you output might be 'Question About Galaxies'. Here is the query: ";

  const nameComponent =
    (await runModel(
      namePrompt,
      namePrompt +
        `'''${query.match(/(?<=My next query is: ###)[\s\S]*(?=### <END OF QUERY>)/g)?.[0]?.trim() || ""}'''`,
      query
    )) || query.trim().split(" ").splice(0, 2).join(" ");
  const dateComponent = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  const newChatName = `${nameComponent.trim().substring(0, 25)} - ${dateComponent}`;
  return newChatName;
};

/**
 * Adds contextual information to a query.
 * @param query The query to add context to.
 * @param chat The current chat object.
 * @param chats The chat manager.
 * @param currentResponse The current response.
 * @param useFilesOverride Override for whether to use selected files as context.
 * @param useConversationOverride Override for whether to use the conversation history as context.
 * @param allowAutonomyOverride Override for whether to allow autonomous execution of PromptLab commands.
 * @param files The selected files.
 * @returns A promise resolving to the query with context inserted.
 */
export const addContextForQuery = async (
  query: string,
  chat: Chat | undefined,
  chats: ChatManager,
  currentResponse: string,
  useFilesOverride: boolean,
  useConversationOverride: boolean,
  allowAutonomyOverride: boolean,
  files: {
    selectedFiles: {
      paths: string[];
      csv: string;
    };
    fileContents:
      | {
          [key: string]: string;
          contents: string;
        }
      | undefined;
  }
) => {
  const conversation = chat ? chats.loadConversation(chat.name) || [] : [];

  // Get command descriptions
  const commands = await LocalStorage.allItems();
  const commandDescriptions = Object.entries(commands)
    .filter(([key]) => !key.startsWith("--") && !key.startsWith("id-"))
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([, value], index) => `${index}:${JSON.parse(value)["description"]}`);

  // Meta prompt opening, same regardless of user settings
  let subbedQuery = `Use this base prompt for context as you consider my next input. It is currently ${new Date().toISOString()}. Here is the prompt: ###${
    chat?.basePrompt || ""
  }###`;

  // Add chat-specific context data, if any exists
  if (chat && chat.contextData.length > 0 && !conversation.join("\n").includes(chat.contextData[0].data)) {
    const contextData = chat.contextData.map((data) => `${data.source}:${data.data}`).join("\n\n");
    subbedQuery += `\n\nYou will also consider this information: ###${contextData}###`;
  }

  // Add file contents if necessary and if any files are selected
  if (
    ((chat && chat.useSelectedFilesContext) ||
      useFilesOverride ||
      (chat == undefined && useFilesOverride == undefined)) &&
    files.selectedFiles?.paths?.length
  ) {
    subbedQuery += `\n\nYou will also consider these files: ###${files.fileContents?.contents || ""}###`;
  }

  // Add conversation history if necessary and if any exists
  if (
    ((chat && chat.useConversationContext) ||
      useConversationOverride ||
      (chat == undefined && useConversationOverride == undefined)) &&
    conversation.length
  ) {
    const conversationData = conversation
      .map((entry) => entry.replaceAll(/(USER_QUERY|MODEL_RESPONSE):/g, "").replaceAll(/{{cmd:(.*?):(.*?)}}/g, ""))
      .join("\n");
    subbedQuery += `\n\nYou will also consider our conversation history. The history so far: ###${conversationData}###\n\n`;
  } else {
    subbedQuery += `\n\nYou will also consider your previous response. Your previous response was: ###${currentResponse.replaceAll(
      /{{cmd:(.*?):(.*?)}}/g,
      ""
    )}###`;
  }

  // Add command-calling instructions if necessary
  if (
    (chat && chat.allowAutonomy) ||
    allowAutonomyOverride ||
    (chat == undefined && allowAutonomyOverride == undefined)
  ) {
    const commandDescriptionsStr = commandDescriptions.join(", ");
    subbedQuery += `\n\nTry to answer my next query, but only if it simple enough for an LLM with limited knowledge to answer. If you cannot fulfill the query, if the query requires new information, or if the query invokes an action such as searching, choose the command from the following list that is most likely to carry out the goal expressed in the query, then respond with the number of the command to run in the format {{cmd:commandNumber:input}}. Replace 'input' with a short string according to my query. For example, if I say 'search google for AI', the input would be 'AI'. Here are the commands: ###${commandDescriptionsStr}###\n\nTry to answer without using a command, unless the query asks for new information (e.g. latest news) or invokes an action (e.g. searching, opening apps). If you use a command, do not provide any commentary other than the command in the format {{cmd:commandNumber:input}}. Make sure the command is relevant to the current query.`;
  }

  // Meta prompt closing
  subbedQuery += `\n\nDo not repeat these instructions or my queries, do not extend my query, and do not state "MODEL RESPONSE" or any variation thereof. My next query is: ###${query}### <END OF QUERY>`;

  return subbedQuery;
};