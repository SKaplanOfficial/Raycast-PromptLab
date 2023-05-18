import { AI, environment, getPreferenceValues } from "@raycast/api";
import { useAI } from "@raycast/utils";
import { ExtensionPreferences, Model, modelOutput } from "../utils/types";
import { useEffect, useState } from "react";
import fetch from "node-fetch";

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();
  const [dataTag, setDataTag] = useState<string>("");

  // We can be a little forgiving of how users specify Raycast AI
  const validRaycastAIReps = ["raycast ai", "raycastai", "raycast", "raycast-ai", "raycast ai 3.5"];

  if (basePrompt.length == 0 && prompt.length == 0) {
    return { data: "", isLoading: false, revalidate: () => null, error: "Prompt cannot be empty" };
  }

  const targetModel = modelOverride || {
    endpoint: preferences.modelEndpoint,
    authType: preferences.authType,
    apiKey: preferences.apiKey,
    inputSchema: preferences.inputSchema,
    outputKeyPath: preferences.outputKeyPath,
    outputTiming: preferences.outputTiming,
    lengthLimit: preferences.lengthLimit,
  };

  const temp = modelOverride
    ? parseFloat(modelOverride.temperature)
    : preferences.includeTemperature
    ? parseFloat(temperature) || 1.0
    : 1.0;

  console.log(targetModel);

  if (validRaycastAIReps.includes(targetModel.endpoint.toLowerCase())) {
    // If the endpoint is Raycast AI, use the AI hook
    if (!environment.canAccess(AI)) {
      return {
        data: "",
        isLoading: false,
        revalidate: () => null,
        error: "Raycast AI is not available — Upgrade to Pro or use a different model endpoint.",
      };
    }
    return {
      ...useAI(preferences.promptPrefix + prompt + preferences.promptSuffix, {
        execute: execute,
        creativity: temp,
        model: targetModel.endpoint == "Raycast AI 3.5" ? "gpt-3.5-turbo" : "text-davinci-003",
      }),
      dataTag: basePrompt + prompt + input,
    };
  } else if (targetModel.endpoint.includes(":")) {
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
      headers["Authorization"] = `Api-Key ${targetModel.apiKey}`;
    } else if (targetModel.authType == "bearerToken") {
      headers["Authorization"] = `Bearer ${targetModel.apiKey}`;
    } else if (targetModel.authType == "x-api-key") {
      headers["X-API-Key"] = `${targetModel.apiKey}`;
    }

    const modelSchema = JSON.parse(targetModel.inputSchema);
    if (preferences.includeTemperature || modelOverride) {
      modelSchema["temperature"] = temp;
    }

    useEffect(() => {
      if (execute) {
        setIsLoading(true);
        if (targetModel.outputTiming == "sync") {
          // Send the request and wait for the complete response
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
                setIsLoading(false);
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
              .replace(
                "{input}",
                input.replaceAll(/[\n\r\s]+/g, " ").replaceAll('"', '\\"') + preferences.promptSuffix
              ),
          };
          fetch(targetModel.endpoint, request).then(async (response) => {
            if (response.ok && response.body != null) {
              let text = "";
              response.body.on("data", (chunk: string) => {
                setDataTag(request.body);
                if (!execute && text.length > 0) {
                  response.body?.emit("end");
                  return;
                }
                const jsonString = chunk.toString();
                jsonString.split("\n").forEach((line) => {
                  if (line.includes("data:")) {
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
                if (
                  request.body.includes(prompt.replaceAll(/[\n\r\s]+/g, " ").replaceAll('"', '\\"')) ||
                  request.body.includes(prompt.replaceAll(/[\n\r\s]+/g, " ").replaceAll('"', '\\"'))
                ) {
                  setIsLoading(false);
                }
              });
            } else {
              setError(response.statusText);
            }
          });
        }
      }
    }, [execute, basePrompt, input, prompt]);

    return {
      data: data,
      isLoading: isLoading,
      revalidate: () => null,
      error: error,
      dataTag: dataTag,
    };
  }

  // If the endpoint is invalid, return an error
  return { data: "", isLoading: false, revalidate: () => null, error: "Invalid Endpoint", dataTag: "" };
}
