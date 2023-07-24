import { getPreferenceValues } from "@raycast/api";
import { ChatCommandPreferences } from "./utils/preferences";
import ChatList from "./components/Chats/ChatList";

export default function ChatCommand(props: { arguments: { initialQuery: string } }) {
  const { initialQuery } = props.arguments;

  const preferences = getPreferenceValues<ChatCommandPreferences>();
  const options = {
    minNumFiles: 1,
    acceptedFileExtensions: undefined,
    useMetadata: true,
    useAudioDetails: true,
    useSubjectClassification: true,
    useRectangleDetection: true,
    useBarcodeDetection: true,
    useFaceDetection: true,
    useSaliencyAnalysis: true,
  };

  return (
    <ChatList
      isLoading={false}
      options={options}
      prompt={preferences.basePrompt}
      initialQuery={initialQuery}
      useFileContext={preferences.useSelectedFiles}
      useConversation={preferences.useConversationHistory}
      useAutonomousFeatures={preferences.autonomousFeatures}
    />
  );
}
