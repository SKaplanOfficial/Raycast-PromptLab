import { useCachedState } from "@raycast/utils";

/**
 * Hook for managing the previous command and response.
 * @returns An object containing data for the previous command and response along with functions to update them.
 */
export const usePreviousCommand = () => {
  const [previousCommand, setPreviousCommand] = useCachedState<string>("promptlab-previous-command", "");
  const [previousCommandResponse, setPreviousCommandResponse] = useCachedState<string>(
    "promptlab-previous-response",
    ""
  );
  const [previousPrompt, setPreviousPrompt] = useCachedState<string>("promptlab-previous-prompt", "");

  return {
    previousCommand,
    setPreviousCommand,
    previousCommandResponse,
    setPreviousCommandResponse,
    previousPrompt,
    setPreviousPrompt,
  };
};
