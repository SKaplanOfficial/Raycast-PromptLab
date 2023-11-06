import { getWeatherData } from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for 7-day weather forecast data at the user's current location, in JSON format.
 */
const WeekWeatherPlaceholder: Placeholder = {
  name: "weekWeather",
  regex: /{{weekWeather}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "weekWeather" in context) {
      return { result: context["weekWeather"] as string, weekWeather: context["weekWeather"] };
    }

    const weather = JSON.stringify(await getWeatherData(7));
    return { result: weather, weekWeather: weather };
  },
  result_keys: ["weekWeather"],
  constant: true,
  fn: async () => (await WeekWeatherPlaceholder.apply("{{weekWeather}}")).result,
  example: "Summarize the following forecast for {{location}} this week: {{weekWeather}}",
  description: "Replaced with 7-day weather forecast data at the user's current location, in JSON format.",
  hintRepresentation: "{{weekWeather}}",
  fullRepresentation: "This Week's Weather",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Weather],
};

export default WeekWeatherPlaceholder;
