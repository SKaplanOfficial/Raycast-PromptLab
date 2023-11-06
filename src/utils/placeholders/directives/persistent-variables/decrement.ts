import { LocalStorage } from "@raycast/api";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";

/**
   * Directive to decrement a persistent counter variable by 1. Returns the new value of the counter.
   */
const DecrementPersistentVariablePlaceholder: Placeholder = {
  name: "decrement",
  regex: /{{decrement:[\\s\\S]*?}}/g,
  apply: async (str: string) => {
    const name = str.match(/(?<=(decrement:))[\s\S]*?(?=}})/)?.[0];
    const identifier = `id-${name}`;
    const value = parseInt((await LocalStorage.getItem(identifier)) || "0") + 1;
    await LocalStorage.setItem(identifier, value.toString());
    return { result: value.toString() };
  },
  constant: false,
  fn: async (id: string) =>
    (await DecrementPersistentVariablePlaceholder.apply(`{{decrement:${id}}}`)).result,
  example: "{{decrement:counter}}",
  description: "Directive to decrement a persistent counter variable by 1.",
  hintRepresentation: "{{decrement:x}}",
  fullRepresentation: "Decrement Persistent Counter Variable",
  type: PlaceholderType.StaticDirective,
  categories: [PlaceholderCategory.Memory],
}

export default DecrementPersistentVariablePlaceholder;