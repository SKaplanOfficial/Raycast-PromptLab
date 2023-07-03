import { environment } from "@raycast/api";
import path from "path";
import * as fs from "fs";
import { Insight, PersistentVariable } from "./types";
import { getStorage } from "./storage-utils";
import { StorageKeys } from "./constants";
import crypto from "crypto";

/**
 * Reads an insight from the insights folder.
 * @param insightId The ID of the insight to read.
 * @returns A promise resolving to the insight if it exists, undefined otherwise.
 */
export const read = async (insightId: string): Promise<Insight | undefined> => {
  const insightFilePath = path.join(environment.supportPath, "insights", insightId + ".json");
  if (!fs.existsSync(insightFilePath)) {
    return undefined;
  }

  try {
    const insightFile = await fs.promises.readFile(insightFilePath);
    return JSON.parse(insightFile.toString());
  } catch (error) {
    console.log(error);
  }
  return undefined;
};

/**
 * Reads all insights from the insights folder.
 * @returns A promise resolving to an array of insights sorted by date descending.
 */
export const all = async (): Promise<Insight[]> => {
  const insightsPath = path.join(environment.supportPath, "insights");

  try {
    const insightFiles = await fs.promises.readdir(insightsPath);
    const insights: Insight[] = [];
    for (const insightFile of insightFiles) {
      const insight = await read(insightFile.replace(".json", ""));
      if (insight) {
        insights.push(insight);
      }
    }
    return insights.sort((a, b) => (b.date > a.date ? 1 : -1));
  } catch (error) {
    console.log(error);
  }
  return [];
};

/**
 * Gets the specified amount of insights sorted by date descending.
 * @param amount The amount of insights to get.
 * @returns A promise resolving to an array of insights sorted by date descending.
 */
export const get = async (amount?: number, tag?: string): Promise<Insight[]> => {
  if (!amount && !tag) {
    return all();
  }

  const insightsPath = path.join(environment.supportPath, "insights");

  try {
    const insightFiles = await fs.promises.readdir(insightsPath);
    const insights: Insight[] = [];

    let iter = 0;
    for (const insightFile of insightFiles) {
      const insight = await read(insightFile.replace(".json", ""));
      if (insight && (!tag || insight.tags.includes(tag))) {
        insights.push(insight);
        iter++;
        if (iter === amount) {
          break;
        }
      }
    }
    return insights.sort((a, b) => (b.date > a.date ? 1 : -1));
  } catch (error) {
    console.log(error);
  }
  return [];
};

/**
 * Gets the insights related to the specified insight. (Only outgoing relations)
 * @param insight The insight to get related insights for.
 * @returns A promise resolving to an array of insights related to the specified insight.
 */
export const relatives = async (insight: Insight): Promise<Insight[]> => {
  const insights = await all();
  return insights.filter((i) => insight.relatedInsights.includes(i.id));
};

/**
 * Gets the insights connected to the specified insight, either as an incoming or outgoing relation.
 * @param insight The insight to get connected insights for.
 * @returns A promise resolving to an array of insights connected to the specified insight.
 */
export const connections = async (insight: Insight): Promise<Insight[]> => {
  const insights = await all();
  const incomingRelations = insights.filter((i) => i.relatedInsights.includes(insight.id));
  const outgoingRelations = insights.filter((i) => insight.relatedInsights.includes(i.id));
  return incomingRelations.concat(outgoingRelations);
};

/**
 * Creates a new insight and saves it to the insights folder.
 * @param title The title of the insight.
 * @param description The descriptive value of the insight.
 * @param tags The tags associated with the insight.
 * @param relatedInsights The IDs of the insights related to this insight.
 * @returns A promise resolving to true if the insight was created successfully, false otherwise.
 */
export const add = async (
  title: string,
  description: string,
  tags: string[],
  relatedInsights: string[]
): Promise<boolean> => {
  await prune();

  const newInsight = {
    id: `IN${crypto.randomUUID()}`,
    title: title,
    description: description,
    date: new Date(),
    tags: tags,
    relatedInsights: relatedInsights,
  };

  const insightFileName = newInsight.id + ".json";
  const insightFilePath = path.join(environment.supportPath, "insights", insightFileName);

  try {
    await fs.promises.writeFile(insightFilePath, JSON.stringify(newInsight));
    return true;
  } catch (error) {
    console.log(error);
  }
  return false;
};

/**
 * Deletes an insight from the insights folder.
 * @param insightId The ID of the insight to delete.
 * @returns A promise resolving to true if the insight was deleted successfully, false otherwise.
 */
export const remove = async (insightId: string): Promise<boolean> => {
  const insightFilePath = path.join(environment.supportPath, "insights", insightId + ".json");
  if (!fs.existsSync(insightFilePath)) {
    return false;
  }

  try {
    await fs.promises.rm(insightFilePath);
    return true;
  } catch (error) {
    console.log(error);
  }
  return false;
};

/**
 * Gets all tags from all insights.
 * @returns A promise resolving to an array of all tags.
 */
export const tags = async (): Promise<string[]> => {
  const insights = await all();
  return insights.flatMap((i) => i.tags);
};

/**
 * Prunes the insights folder to only contain the 100 most recent insights.
 * @returns A promise that resolves when the pruning is complete.
 */
export const prune = async (): Promise<void> => {
  const insights = await all();
  if (insights.length <= 100) {
    return;
  }

  const insightsToDelete = insights.slice(100);
  for (const insight of insightsToDelete) {
    await remove(insight.id);
  }
};

/**
 * Clears all insights from the insights folder.
 */
export const clear = async (): Promise<void> => {
  const insights = await all();
  for (const insight of insights) {
    await remove(insight.id);
  }
};

/**
 * Gets the most frequently occurring values for a given data tag.
 * @param dataTag The storage key of the data tag.
 * @param key The object key to which the data tag is mapped.
 * @param n The number of values to return.
 * @param notIn An array of objects to exclude from the result.
 * @returns A promise resolving to an array of the most frequently occurring values.
 */
export const objectsByFrequency = async (dataTag: string, key: string, n: number, notIn?: object[]) => {
  const vars: PersistentVariable[] = await getStorage(StorageKeys.PERSISTENT_VARIABLES);
  const counts = vars
    .filter((v) => v.name.endsWith(dataTag))
    .sort((a, b) => (parseInt(a.value) > parseInt(b.value) ? -1 : 1))
    .map((v) => v.name.replace(dataTag, ""))
    .filter((c) => (notIn ? !notIn.find((obj) => (obj as { [key: string]: string })[key] == c) : true));
  return counts.slice(0, n);
};
