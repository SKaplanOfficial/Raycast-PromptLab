import { AI, environment, getPreferenceValues } from "@raycast/api";
import { useAI, useFetch } from "@raycast/utils";
import { ExtensionPreferences, Model, modelOutput } from "../utils/types";
import { useEffect, useState } from "react";
import fetch from "node-fetch";
import { useModels } from "./useModels";

/**
 * Gets the text response from the model endpoint.
 *
 * @param prompt The full prompt to send to the endpoint.
 * @param execute Whether to execute the request immediately or wait until this value becomes true.
 * @returns The string output received from the model endpoint.
 */
export default function useModel(
  basePrompt: string,
  prompt: string,
  input: string,
  temperature: string,
  execute: boolean,
  modelOverride?: Model
) {
  const preferences = getPreferenceValues<ExtensionPreferences>();
  const [data, setData] = useState<string>("");
  const [error, setError] = useState<string>();
  const [dataTag, setDataTag] = useState<string>("");
  const [numRequests, setNumRequests] = useState<number>(0);
  const models = useModels();

  // We can be a little forgiving of how users specify Raycast AI
  const validRaycastAIReps = ["raycast ai", "raycastai", "raycast", "raycast-ai", "raycast ai 3.5"];

  if (basePrompt.length == 0 && prompt.length == 0) {
    return { data: "", isLoading: false, revalidate: () => null, error: "Prompt cannot be empty", dataTag: "" };
  }

  const fallbackModel: Model = {
    endpoint: "Raycast AI",
    authType: "",
    apiKey: "",
    inputSchema: "",
    outputKeyPath: "",
    outputTiming: "async",
    lengthLimit: "2500",
    temperature: "1.0",
    name: "Text-Davinci-003 Via Raycast AI",
    description: "",
    favorited: false,
    id: "",
    icon: "",
    iconColor: "",
    notes: "",
    isDefault: false,
  };
  const defaultModel = models.models.find((model) => model.isDefault);
  const targetModel = modelOverride || defaultModel || fallbackModel;

  const temp = modelOverride
    ? parseFloat(targetModel.temperature)
    : preferences.includeTemperature
    ? parseFloat(temperature) || 1.0
    : 1.0;

  // If the endpoint is a URL, use the fetch hook
  const headers: { [key: string]: string } = {
    method: "POST",
    "Content-Type": "application/json",
  };

  // Get the value at the specified key path
  const get = (obj: modelOutput | string, pathString: string, def?: string) => {
    const path: string[] = [];

    // Split the key path string into an array of keys
    pathString
      .trim()
      .split(".")
      .forEach(function (item) {
        item.split(/\[([^}]+)\]/g).forEach(function (key) {
          if (key.length > 0) {
            path.push(key);
          }
        });
      });

    let current = obj;
    if (typeof current == "object") {
      for (let i = 0; i < path.length; i++) {
        if (!(current as modelOutput)[path[i]]) return def;
        current = (current as modelOutput)[path[i]];
      }
    }
    return current;
  };

  // Add the authentication header if necessary
  if (targetModel.authType == "apiKey") {
    headers["Authorization"] = `Api-Key ${targetModel.apiKey.trim()}`;
  } else if (targetModel.authType == "bearerToken") {
    headers["Authorization"] = `Bearer ${targetModel.apiKey.trim()}`;
  } else if (targetModel.authType == "x-api-key") {
    headers["X-API-Key"] = `${targetModel.apiKey.trim()}`;
  }

  const modelSchema =
    validRaycastAIReps.includes(targetModel.endpoint.toLowerCase()) || models.isLoading
      ? {}
      : JSON.parse(targetModel.inputSchema);
  if (preferences.includeTemperature || modelOverride) {
    modelSchema["temperature"] = temp;
  }

  useEffect(() => {
    if (validRaycastAIReps.includes(targetModel.endpoint.toLowerCase()) || (models.isLoading && !modelOverride)) {
      return;
    }

    if (execute) {
      if (targetModel.outputTiming == "sync") {
        // Send the request and wait for the complete response
        setNumRequests(numRequests + 1);
        fetch(targetModel.endpoint, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(modelSchema)
            .replace(
              "{prompt}",
              preferences.promptPrefix +
                prompt.replaceAll(/[\n\r\s]+/g, " ").replaceAll('"', '\\"') +
                preferences.promptSuffix
            )
            .replace(
              "{basePrompt}",
              preferences.promptPrefix + basePrompt.replaceAll(/[\n\r\s]+/g, " ").replaceAll('"', '\\"')
            )
            .replace(
              "{input}",
              targetModel.inputSchema.includes("{prompt") && prompt == input
                ? ""
                : input.replaceAll(/[\n\r\s]+/g, " ").replaceAll('"', '\\"') + preferences.promptSuffix
            ),
        }).then(async (response) => {
          if (response.ok) {
            try {
              const jsonData = await response.json();
              const output = get(jsonData as modelOutput, targetModel.outputKeyPath) as string;
              setData(output);
              setNumRequests(numRequests - 1);
            } catch {
              setError("Couldn't parse model output");
            }
          } else {
            setError(response.statusText);
          }
        });
      } else if (targetModel.outputTiming == "async") {
        // Send the request and parse each data chunk as it arrives
        const request = {
          method: "POST",
          headers: headers,
          body: JSON.stringify(modelSchema)
            .replace(
              "{prompt}",
              preferences.promptPrefix +
                prompt.replaceAll(/[\n\r\s]+/g, " ").replaceAll('"', '\\"') +
                preferences.promptSuffix
            )
            .replace(
              "{basePrompt}",
              preferences.promptPrefix + basePrompt.replaceAll(/[\n\r\s]+/g, " ").replaceAll('"', '\\"')
            )
            .replace("{input}", input.replaceAll(/[\n\r\s]+/g, " ").replaceAll('"', '\\"') + preferences.promptSuffix),
        };

        setDataTag(request.body);
        setNumRequests(numRequests + 1);
        fetch(targetModel.endpoint, request).then(async (response) => {
          if (response.ok && response.body != null) {
            let text = "";
            response.body.on("data", (chunk: string) => {
              if (!execute && text.length > 0) {
                response.body?.emit("end");
                return;
              }
              const jsonString = chunk.toString();
              jsonString.split("\n").forEach((line) => {
                if (line.startsWith("data: [DONE]")) {
                  response.body?.emit("end");
                } else if (line.includes("data:")) {
                  try {
                    const jsonData = JSON.parse(line.substring(5));
                    const output = get(jsonData, targetModel.outputKeyPath) || "";
                    if (output.toString().includes(text)) {
                      text = output.toString();
                    } else {
                      text = text + output;
                    }
                    setData(text);
                  } catch (e) {
                    console.error("Failed to get JSON from model output");
                  }
                }
              });
            });
            response.body.on("end", () => {
              // Verify that the current prompt is still the same as the one that was sent
              setNumRequests(numRequests - 1);
            });
          } else {
            setError(response.statusText);
          }
        });
      }
    }
  }, [execute, basePrompt, input, prompt]);

  const res = environment.canAccess(AI)
    ? {
        ...useAI(preferences.promptPrefix + prompt + preferences.promptSuffix, {
          execute: execute,
          creativity: temp,
          model: targetModel.endpoint == "Raycast AI 3.5" ? "gpt-3.5-turbo" : "text-davinci-003",
        }),
        dataTag: basePrompt + prompt + input,
      }
    : {
        data: data,
        isLoading: numRequests > 0,
        revalidate: () => null,
        error: error,
        dataTag: dataTag,
      };

  if (validRaycastAIReps.includes(targetModel.endpoint.toLowerCase()) || models.isLoading) {
    // If the endpoint is Raycast AI, use the AI hook
    if (models.isLoading) {
      return {
        data: "",
        isLoading: true,
        revalidate: () => null,
        error: undefined,
        dataTag: basePrompt + prompt + input,
      };
    } else {
      return res;
    }
  } else if (targetModel.endpoint.includes(":")) {
    return {
      data: data,
      isLoading: numRequests > 0,
      revalidate: () => null,
      error: error,
      dataTag: dataTag,
    };
  }

  // If the endpoint is invalid, return an error
  return { data: "", isLoading: false, revalidate: () => null, error: "Invalid Endpoint", dataTag: "" };
}
