import { filterString } from "../../../context-utils";
import { ScriptRunner } from "../../../scripts";
import { CalendarDuration, EventType } from "../../../types";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";

/**
 * Placeholder for a comma-separated list of the name and due date/time of all reminders that are scheduled over the next 24 hours.
 */
const TodayRemindersPlaceholder: Placeholder = {
  name: "todayReminders",
  regex: /{{(todayReminders|todayTasks|todayTodos)}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "todayReminders" in context) {
      return { result: context["todayReminders"] as string, todayReminders: context["todayReminders"] };
    }

    const reminders = filterString(await ScriptRunner.Events(EventType.REMINDER, CalendarDuration.DAY));
    return { result: reminders, todayReminders: reminders };
  },
  result_keys: ["todayReminders"],
  constant: true,
  fn: async () => (await TodayRemindersPlaceholder.apply("{{todayReminders}}")).result,
  example: "Tell me about my reminders today based on the following list: {{todayReminders}}.",
  description:
    "Replaced with a list of the name and due date/time of all reminders that are scheduled over the next 24 hours.",
  hintRepresentation: "{{todayReminders}}",
  fullRepresentation: "Today's Reminders",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Calendar],
};

export default TodayRemindersPlaceholder;
