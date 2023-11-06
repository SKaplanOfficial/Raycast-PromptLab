import { DefaultPlaceholders } from "./defaultPlaceholders";
import { Placeholder } from "./types";

/**
 * Applies placeholders to a single string.
 * @param str The string to apply placeholders to.
 * @returns The string with placeholders applied.
 */
export const applyToString = async (str: string, context?: { [key: string]: unknown }) => {
  let subbedStr = str;
  for (const placeholder of DefaultPlaceholders) {
    if (!subbedStr.match(placeholder.regex)) continue;
    while (subbedStr.match(placeholder.regex) != undefined) {
      subbedStr = subbedStr.replace(placeholder.regex, (await placeholder.apply(subbedStr, context)).result);
    }
  }
  return subbedStr;
};

/**
 * Applies placeholders to an array of strings.
 * @param strs The array of strings to apply placeholders to.
 * @returns The array of strings with placeholders applied.
 */
export const applyToStrings = async (strs: string[], context?: { [key: string]: string }) => {
  const subbedStrs: string[] = [];
  for (const str of strs) {
    subbedStrs.push(await applyToString(str, context));
  }
  return subbedStrs;
};

/**
 * Applies placeholders to the value of a single key in an object.
 * @param obj The object to apply placeholders to.
 * @param key The key of the value to apply placeholders to.
 * @returns The object with placeholders applied.
 */
export const applyToObjectValueWithKey = async (
  obj: { [key: string]: unknown },
  key: string,
  context?: { [key: string]: string },
) => {
  const value = obj[key];
  if (typeof value === "string") {
    return await applyToString(value, context);
  } else if (Array.isArray(value)) {
    return await applyToStrings(value, context);
  } else if (typeof value === "object") {
    return await applyToObjectValuesWithKeys(
      value as { [key: string]: unknown },
      Object.keys(value as { [key: string]: unknown }),
      context,
    );
  } else {
    return (value || "undefined").toString();
  }
};

/**
 * Applies placeholders to an object's values, specified by keys.
 * @param obj The object to apply placeholders to.
 * @param keys The keys of the object to apply placeholders to.
 * @returns The object with placeholders applied.
 */
export const applyToObjectValuesWithKeys = async (
  obj: { [key: string]: unknown },
  keys: string[],
  context?: { [key: string]: string },
) => {
  const subbedObj: { [key: string]: unknown } = {};
  for (const key of keys) {
    subbedObj[key] = await applyToObjectValueWithKey(obj, key, context);
  }
  return subbedObj;
};

/**
 * Gets a list of placeholders that are included in a string.
 * @param str The string to check.
 * @returns The list of {@link Placeholder} objects.
 */
export const checkForPlaceholders = async (str: string, customPlaceholders?: Placeholder[]): Promise<Placeholder[]> => {
  const sortedPlaceholders = [...(customPlaceholders || []), ...DefaultPlaceholders];
  const includedPlaceholders = sortedPlaceholders
    .filter((placeholder) => {
      return (
        str.match(placeholder.regex) != undefined ||
        str.match(new RegExp("(^| )" + placeholder.regex.source.replace("{{", "").replace("}}", ""), "g")) !=
          undefined ||
        str.match(new RegExp(`(^| )(?<!{{)${placeholder.name.replace(/[!#+-]/g, "\\$1")}(?!}})`, "g")) != undefined
      );
    })
    .sort((placeholderA, placeholderB) => {
      // Order definitive occurrences first
      if (str.match(placeholderA.regex)) {
        return -1;
      } else if (str.match(placeholderB.regex)) {
        return 1;
      } else {
        return 0;
      }
    });
  return includedPlaceholders;
};

/**
 * Applies placeholders to a string by memoizing the results of each placeholder.
 * @param str The string to apply placeholders to.
 * @returns The string with placeholders substituted.
 */
export const bulkApply = async (
  str: string,
  context?: { [key: string]: string },
  customPlaceholders?: Placeholder[],
): Promise<string> => {
  const sortedPlaceholders = [...(customPlaceholders || []), ...DefaultPlaceholders];

  let subbedStr = str;
  const result = { ...(context || {}) };

  // Apply any substitutions that are already in the context
  for (const contextKey in context) {
    const keyHolder = sortedPlaceholders.find((placeholder) => placeholder.name == contextKey);
    if (keyHolder && !(contextKey == "input" && context[contextKey] == "")) {
      subbedStr = subbedStr.replace(
        new RegExp(keyHolder.regex.source + "(?=(}}|[\\s\\S]|$))", "g"),
        context[contextKey],
      );
    }
  }

  for (const placeholder of sortedPlaceholders) {
    const keysToCheck = [];
    if (subbedStr.match(placeholder.regex)) {
      keysToCheck.push(placeholder.regex);
    }

    // Skip if the placeholder isn't in the string
    if (keysToCheck.length == 0) continue;

    const result_keys = placeholder.result_keys?.filter(
      (key) => !(key in result) || (result[key] == "" && key == "input"),
    );
    if (result_keys != undefined && result_keys.length == 0) continue; // Placeholder is already in the context

    // Add any dependencies of this placeholder to the list of keys to check
    keysToCheck.push(
      ...(placeholder.dependencies?.reduce((acc, dependencyName) => {
        // Get the placeholder that matches the dependency name
        const dependency = sortedPlaceholders.find((placeholder) => placeholder.name == dependencyName);
        if (!dependency) return acc;

        // Add the placeholder key to the list of keys to check
        acc.push(dependency.regex);
        return acc;
      }, [] as RegExp[]) || []),
    );

    for (const newKey of keysToCheck) {
      // Apply the placeholder and store the result
      while (subbedStr.match(newKey) != undefined) {
        const intermediateResult = await placeholder.apply(subbedStr, result);

        if (placeholder.constant) {
          subbedStr = subbedStr.replace(
            new RegExp(newKey.source + "(?=(}}|[\\s\\S]|$))", "g"),
            intermediateResult.result,
          );
        } else {
          subbedStr = subbedStr.replace(new RegExp(newKey.source + "(?=(}}|[\\s\\S]|$))"), intermediateResult.result);
        }

        for (const [key, value] of Object.entries(intermediateResult)) {
          result[key] = value as string;
          if (result_keys?.includes(key)) {
            result_keys.splice(result_keys.indexOf(key), 1);
          }
        }

        // Don't waste time applying other occurrences if the result is constant
        if (placeholder.constant) {
          break;
        }
      }
    }
  }
  return subbedStr;
};
