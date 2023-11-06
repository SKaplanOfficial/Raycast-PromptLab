import { runAppleScript } from "@raycast/utils";
import { Browser } from "./types";

const name = "Arc";

const version = async () => {
  return await runAppleScript(`tell application "Arc" to return version`);
};

const bundleID = async () => {
  return await runAppleScript(`tell application "Arc" to return id`);
};

const bundlePath = async () => {
  return await runAppleScript(`tell application "Arc" to return POSIX path of (path to it)`);
};

const currentURL = async () => {
  return await runAppleScript(`try
  tell application "Arc"
    return URL of active tab of window 1
  end tell
end try`);
};

const currentTabText = async () => {
  return await runJSInActiveTab(`document.body.innerText`);
};

const runJSInActiveTab = async (script: string) => {
  return await runAppleScript(`tell application "Arc"
  set theTab to active tab of front window
  set js to "try {
    ${script}
  } catch {
    '';
  }"
  
  tell front window's active tab
    return execute javascript js
  end tell
end tell`);
};

const Arc: Browser = {
  name,
  version,
  bundleID,
  bundlePath,
  currentURL,
  currentTabText,
  runJSInActiveTab,
};

export default Arc;
