import { getPreferenceValues, useUnstableAI } from "@raycast/api";
import { ExtensionPreferences, modelOutput } from "./types";
import { useFetch } from "@raycast/utils";

export default function useModel(prompt: string, execute: boolean) {
  const preferences = getPreferenceValues<ExtensionPreferences>();

  // We can be a little forgiving of how users specify Raycast AI
  const validRaycastAIReps = ["raycast ai", "raycastai", "raycast", "raycast-ai"];

  if (validRaycastAIReps.includes(preferences.modelEndpoint.toLowerCase())) {
    return useUnstableAI(prompt, { execute: execute });
  } else if (preferences.modelEndpoint.includes(":")) {
    const { data, isLoading, revalidate, error } = useFetch(preferences.modelEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${preferences.apiKey}`,
        "Content-Type": "application/json",
      },
      body: preferences.inputSchema.replace("{input}", prompt.replaceAll(/[\n\r\s]+/g, " ").replaceAll('"', '\\"')),
      execute: execute,
    });

    const get = (obj: modelOutput | string, pathString: string, def?: string) => {
      const path: string[] = [];

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
      output = get(data as modelOutput, preferences.outputKeyPath) as string;
    } else if (typeof data == "string") {
      output = data;
    }

    return {
      data: output,
      isLoading: isLoading,
      revalidate: revalidate,
      error: error,
    };
  }
  return { data: "", isLoading: false, revalidate: () => null, error: "Invalid Endpoint" };
}
