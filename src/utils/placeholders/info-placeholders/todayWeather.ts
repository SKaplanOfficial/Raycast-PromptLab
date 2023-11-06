import { getWeatherData } from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for 24-hour weather forecast data at the user's current location, in JSON format.
 */
const TodayWeatherPlaceholder: Placeholder = {
  name: "todayWeather",
  regex: /{{todayWeather}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "todayWeather" in context) {
      return { result: context["todayWeather"] as string, todayWeather: context["todayWeather"] };
    }

    const weather = JSON.stringify(await getWeatherData(1));
    return { result: weather, todayWeather: weather };
  },
  result_keys: ["todayWeather"],
  constant: true,
  fn: async () => (await TodayWeatherPlaceholder.apply("{{todayWeather}}")).result,
  example: "Summarize the following forecast for {{location}} today: {{todayWeather}}",
  description: "Replaced with 24-hour weather forecast data at the user's current location, in JSON format.",
  hintRepresentation: "{{todayWeather}}",
  fullRepresentation: "Today's Weather",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Weather],
};

export default TodayWeatherPlaceholder;
