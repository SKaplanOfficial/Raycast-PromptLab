/**
 * @file useSpeech.ts
 *
 * @summary Speech hook for spoken responses to PromptLab commands.
 * @author Stephen Kaplan <skaplanofficial@gmail.com>
 *
 * Created at     : 2023-07-05 11:14:28 
 * Last modified  : 2023-07-05 11:31:32
 */

import path from 'path';
import { useEffect, useRef, useState } from 'react';

import { environment } from '@raycast/api';

import { execScript } from '../utils/scripts';
import { CommandOptions } from '../utils/types';

/**
 * Hook for managing spoken responses.
 * @param options The command options.
 * @param isLoading Whether the command is loading.
 * @param response The response to speak.
 * @returns An object containing the speaking state, the spoken response state, a function to start speaking, a function to stop speaking, and a function to restart speaking.
 */
export const useSpeech = (options: CommandOptions, isLoading: boolean, response: string) => {
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [spokenResponse, setSpokenResponse] = useState<boolean>(false);
  const sendContent = useRef<(message: string) => void>();
  const stopSpeech = useRef<() => void>();
  const [restartSpeech, setRestartSpeech] = useState<boolean>(false);
  const startedLoading = useRef<boolean>(false);

  /**
   * Starts speaking the response.
   */
  const startSpeaking = (content?: string) => {
    setSpeaking(true);
    const scriptPath = path.resolve(environment.assetsPath, "scripts", "SpeechSynthesis.scpt");
    const { data, sendMessage } = execScript(scriptPath, [isLoading], "JavaScript", (data) => console.info(data));
    sendContent.current = sendMessage;
    stopSpeech.current = () => {
      sendMessage("$$stop$$");
      setSpeaking(false);
    };

    if (content) {
      // Speak the provided content.
      sendMessage(`$$msg$$${content}`);
    }

    data.then(() => {
      setSpeaking(false);
      setSpokenResponse(true);
    });
  };

  useEffect(() => {
    if (options.speakResponse) {
      // Speak the response when the command is first run, if the option is enabled.
      startSpeaking();
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !startedLoading.current && response != "Loading response...") {
      // Mark the end of new response data.
      sendContent.current?.(`$$endData$$$$msg$$${response}`);
    } else if (response?.length > 0 && options.speakResponse && !spokenResponse) {
      // Add the response to the speech queue.
      sendContent.current?.(`$$msg$$${response}`);
    }
  }, [isLoading, response]);

  useEffect(() => {
    if (!speaking && restartSpeech) {
      // Speak the entire response again.
      startSpeaking(response);
      sendContent.current?.(`$$msg$$${response}`);
      setRestartSpeech(false);
    }
  }, [speaking, restartSpeech, response]);

  return { speaking, stopSpeech: stopSpeech.current, restartSpeech: () => setRestartSpeech(true) };
};
