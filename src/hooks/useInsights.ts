import { useEffect, useState } from "react";
import * as Insights from "../utils/insights";
import { Insight, InsightManager } from "../utils/types";

/**
 * Hook for managing insights in a stateful way.
 * @returns The insight manager object.
 */
export default function useInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadInsights = async () => {
    const insights = await Insights.all();
    setInsights(insights);
  };

  const revalidate = async () => {
    setIsLoading(true);
    loadInsights().then(() => setIsLoading(false));
  };

  useEffect(() => {
    revalidate();
  }, []);

  return {
    insights,
    loadingInsights: isLoading,
    revalidateInsights: revalidate,
  } as InsightManager;
}
