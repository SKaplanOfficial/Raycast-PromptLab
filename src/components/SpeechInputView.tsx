import { Detail, Toast, environment, showToast } from "@raycast/api";
import { useEffect, useState } from "react";
import { execScript } from "../utils/scripts";
import path from "path";

interface SpeechInputProps {
  prompt: string;
  setSpeechInput: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export default function SpeechInputView(props: SpeechInputProps) {
  const { prompt, setSpeechInput } = props;
  const [currentInput, setCurrentInput] = useState<string>("");

  useEffect(() => {
    const blah = async () => {
      const toast = await showToast({ title: "Listening...", style: Toast.Style.Animated });
      const scriptPath = path.resolve(environment.assetsPath, "scripts", "SpeechInput.scpt");

      Promise.race([
        execScript(scriptPath, [], "JavaScript", (output) => {
          setCurrentInput((current: string) => current + output);
        }),
        new Promise((resolve) => setTimeout(resolve, 600000)),
      ]).then((final) => {
        if (typeof final == "string") {
          toast.title = "Done";
          toast.message = "Speech Input Complete";
          toast.style = Toast.Style.Success;
          setSpeechInput(final);
        } else {
          toast.title = "Error";
          toast.message = "Speech Input Failed";
          toast.style = Toast.Style.Failure;
          setSpeechInput(currentInput);
        }
      });
    };

    Promise.resolve(blah()).then(() => console.log("done"));
  }, []);

  return <Detail markdown={`_Prompt: ${prompt}_\n\nYour input: ${currentInput}`} />;
}
