/**
 * A user-defined variable created via the {{set:...}} placeholder. These variables are stored in the extension's persistent local storage.
 */
export type PersistentVariable = {
  /**
   * The name of the variable.
   */
  name: string;

  /**
   * The current value of the variable.
   */
  value: string;

  /**
   * The original value of the variable.
   */
  initialValue: string;
};
