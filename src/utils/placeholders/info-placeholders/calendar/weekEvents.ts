import { filterString } from "../../../context-utils";
import { ScriptRunner } from "../../../scripts";
import { CalendarDuration, EventType } from "../../../types";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";

/**
 * Placeholder for a comma-separated list of the name, start time, and end time of all calendar events that are scheduled over the next 7 days.
 */
const WeekEventsPlaceholder: Placeholder = {
  name: "weekEvents",
  regex: /{{weekEvents}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "weekEvents" in context) {
      return { result: context["weekEvents"] as string, weekEvents: context["weekEvents"] };
    }

    const events = filterString(await ScriptRunner.Events(EventType.CALENDAR, CalendarDuration.WEEK));
    return { result: events, weekEvents: events };
  },
  result_keys: ["weekEvents"],
  constant: true,
  fn: async () => (await WeekEventsPlaceholder.apply("{{weekEvents}}")).result,
  example: "Tell me about my events this week based on the following list: {{weekEvents}}.",
  description:
    "Replaced with a list of the name, start time, and end time of all calendar events scheduled over the next 7 days.",
  hintRepresentation: "{{weekEvents}}",
  fullRepresentation: "This Week's Calendar Events",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Calendar],
};

export default WeekEventsPlaceholder;
