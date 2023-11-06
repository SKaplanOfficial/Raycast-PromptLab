/**
 * A placeholder type that associates Regex patterns with functions that applies the placeholder to a string, rules that determine whether or not the placeholder should be replaced, and aliases that can be used to achieve the same result.
 */
export type PlaceholderList = {
  [key: string]: Placeholder;
};

export type Placeholder = {
  /**
   * The detailed name of the placeholder.
   */
  name: string;

  /**
   * The regex pattern that matches the placeholder, including any aliases.
   */
  regex: RegExp;

  /**
   * The function that applies the placeholder to a string.
   * @param str The string to apply the placeholder to.
   * @returns The string with the placeholder applied.
   */
  apply: (str: string, context?: { [key: string]: unknown }) => Promise<{ result: string; [key: string]: unknown }>;

  /**
   * The keys of the result object relevant to the placeholder. When placeholders are applied in bulk, this list is used to determine which keys to return as well as to make optimizations when determining which placeholders to apply. The first key in the list is the key for the placeholder's value.
   */
  result_keys?: string[];

  /**
   * The dependencies of the placeholder. When placeholders are applied in bulk, this list is used to determine the order in which placeholders are applied.
   */
  dependencies?: string[];

  /**
   * Whether or not the placeholder has a constant value during the placeholder substitution process. For example, users can use multiple URL placeholders, therefore it is not constant, while {{clipboardText}} is constant for the duration of the substitution process.
   */
  constant: boolean;

  /**
   * The function that applies the placeholder to a string. This function is used when the placeholder is used a {{js:...}} placeholder.
   * @param args
   * @returns
   */
  fn: (...args: (never | string)[]) => Promise<string>;

  /**
   * The example usage of the placeholder, shown when the placeholder is detected in a prompt.
   */
  example: string;

  /**
   * The description of the placeholder, shown when the placeholder is detected in a prompt.
   */
  description: string;

  /**
   * The demonstration representation of the placeholder, shown as the "name" of the placeholder when the placeholder is detected in a prompt.
   */
  hintRepresentation: string;

  /**
   * The full name representation of the placeholder, properly spaced.
   */
  fullRepresentation: string;

  /**
   * The type of the placeholder, used to inform design decisions.
   */
  type: PlaceholderType;

  /**
   * The category of the placeholder, used to inform design decisions.
   */
  categories: PlaceholderCategory[];
};

/**
 * High-level placeholder types.
 */
export enum PlaceholderType {
  /**
   * A placeholder that quickly evaluates to a consistently formatted value.
   */
  Informational,

  /**
   * A placeholder that completes a brief action, then evaluates to a short or empty value.
   */
  StaticDirective,

  /**
   * A placeholder that requires user input or a long-running action to evaluate.
   */
  InteractiveDirective,

  /**
   * A placeholder that executes a script and evaluates to an arbitrary value.
   */
  Script,
}

/**
 * Mid-level categories of placeholders.
 */
export enum PlaceholderCategory {
  Memory,
  Calendar,
  Weather,
  Location,
  Device,
  Alert,
  Internet,
  Files,
  Meta,
  Logic,
  Applications,
  API,
  Other,
  Custom,
}