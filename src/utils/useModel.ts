import { getPreferenceValues, useUnstableAI } from "@raycast/api";
import { ExtensionPreferences, modelOutput } from "./types";
import { useFetch } from "@raycast/utils";

/**
 * Gets the text response from the model endpoint.
 *
 * @param prompt The full prompt to send to the endpoint.
 * @param execute Whether to execute the request immediately or wait until this value becomes true.
 * @returns The string output received from the model endpoint.
 */
export default function useModel(prompt: string, execute: boolean) {
  const preferences = getPreferenceValues<ExtensionPreferences>();

  // We can be a little forgiving of how users specify Raycast AI
  const validRaycastAIReps = ["raycast ai", "raycastai", "raycast", "raycast-ai"];

  if (validRaycastAIReps.includes(preferences.modelEndpoint.toLowerCase())) {
    // If the endpoint is Raycast AI, use the unstable AI hook
    return useUnstableAI(prompt, { execute: execute });
  } else if (preferences.modelEndpoint.includes(":")) {
    // If the endpoint is a URL, use the fetch hook
    const { data, isLoading, revalidate, error } = useFetch(preferences.modelEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${preferences.apiKey}`,
        "Content-Type": "application/json",
      },
      body: preferences.inputSchema.replace("{input}", prompt.replaceAll(/[\n\r\s]+/g, " ").replaceAll('"', '\\"')),
      execute: execute,
    });

    // Get the value at the specified key path
    const get = (obj: modelOutput | string, pathString: string, def?: string) => {
      const path: string[] = [];

      // Split the key path string into an array of keys
      pathString.split(".").forEach(function (item) {
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

    let output = "";
    if (typeof data == "object") {
      // Get the output from the configured key path
      output = get(data as modelOutput, preferences.outputKeyPath) as string;
    } else if (typeof data == "string") {
      // If the output is a string, just use it
      output = data;
    }

    return {
      data: output,
      isLoading: isLoading,
      revalidate: revalidate,
      error: error,
    };
  }

  // If the endpoint is invalid, return an error
  return { data: "", isLoading: false, revalidate: () => null, error: "Invalid Endpoint" };
}
