import { STORAGE_KEYS } from "../../../constants";
import { getStorage, setStorage } from "../../../storage-utils";
import { PersistentVariable } from "./types";

/**
 * Gets the current value of persistent variable from the extension's persistent local storage.
 * @param name The name of the variable to get.
 * @returns The value of the variable, or an empty string if the variable does not exist.
 */
export const getPersistentVariable = async (name: string): Promise<string> => {
  const vars: PersistentVariable[] = await getStorage(STORAGE_KEYS.PERSISTENT_VARIABLES);
  const variable = vars.find((variable) => variable.name == name);
  if (variable) {
    return variable.value;
  }
  return "";
};

/**
 * Sets the value of a persistent variable in the extension's persistent local storage. If the variable does not exist, it will be created. The most recently set variable will be always be placed at the end of the list.
 * @param name The name of the variable to set.
 * @param value The initial value of the variable.
 */
export const setPersistentVariable = async (name: string, value: string) => {
  const vars: PersistentVariable[] = await getStorage(STORAGE_KEYS.PERSISTENT_VARIABLES);
  const variable = vars.find((variable) => variable.name == name);
  if (variable) {
    vars.splice(vars.indexOf(variable), 1);
    variable.value = value;
    vars.push(variable);
  } else {
    vars.push({ name: name, value: value, initialValue: value });
  }
  await setStorage(STORAGE_KEYS.PERSISTENT_VARIABLES, vars);
};

/**
 * Resets the value of a persistent variable to its initial value. If the variable does not exist, nothing will happen.
 * @param name The name of the variable to reset.
 */
export const resetPersistentVariable = async (name: string): Promise<string> => {
  const vars: PersistentVariable[] = await getStorage(STORAGE_KEYS.PERSISTENT_VARIABLES);
  const variable = vars.find((variable) => variable.name == name);
  if (variable) {
    vars.splice(vars.indexOf(variable), 1);
    variable.value = variable.initialValue;
    vars.push(variable);
    await setStorage(STORAGE_KEYS.PERSISTENT_VARIABLES, vars);
    return variable.value;
  }
  return "";
};

/**
 * Deletes a persistent variable from the extension's persistent local storage. If the variable does not exist, nothing will happen.
 * @param name The name of the variable to delete.
 */
export const deletePersistentVariable = async (name: string) => {
  const vars: PersistentVariable[] = await getStorage(STORAGE_KEYS.PERSISTENT_VARIABLES);
  const variable = vars.find((variable) => variable.name == name);
  if (variable) {
    vars.splice(vars.indexOf(variable), 1);
    await setStorage(STORAGE_KEYS.PERSISTENT_VARIABLES, vars);
  }
};
