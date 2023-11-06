/**
 * A web browser application.
 */
export interface Browser {
  /**
   * The name of the browser.
   */
  name: string;

  /**
   * Gets the version of the browser.
   * @returns A promise resolving to a string.
   */
  version: () => Promise<string>;

  /**
   * Gets the bundle ID of the browser.
   * @returns A promise resolving to a string.
   */
  bundleID: () => Promise<string>;

  /**
   * Gets the bundle path of the browser.
   * @returns A promise resolving to a string.
   */
  bundlePath: () => Promise<string>;

  /**
   * Gets the current URL of the browser.
   * @returns A promise resolving to a string.
   */
  currentURL: () => Promise<string>;

  /**
   * Gets the current tab text of the browser.
   * @returns A promise resolving to a string.
   */
  currentTabText: () => Promise<string>;

  /**
   * Runs the specified JavaScript in the active tab of the browser.
   * @param script The JavaScript to run.
   * @returns A promise resolving to the result of executing the JavaScript.
   */
  runJSInActiveTab: (script: string) => Promise<string>;
}