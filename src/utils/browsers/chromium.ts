import { runAppleScript } from "@raycast/utils";
import { Browser } from "./types";

const Chromium = (name = "Chromium"): Browser => {
  const runJSInActiveTab = async (script: string) => {
    return await runAppleScript(`tell application "${name}"
      set theTab to active tab of window 1
      tell theTab
        return execute javascript "try {
                  ${script}
                } catch {
                  '';
                }"
      end tell
    end tell`);
  };

  return {
    name,
    version: async () => {
      return await runAppleScript(`tell application "${name}" to return version`);
    },
    bundleID: async () => {
      return await runAppleScript(`tell application "${name}" to return id`);
    },
    bundlePath: async () => {
      return await runAppleScript(`tell application "${name}" to return POSIX path of (path to it)`);
    },
    currentURL: async () => {
      return runAppleScript(`try
        tell application "${name}"
          set tabIndex to active tab index of window 1
          return URL of tab tabIndex of window 1
        end tell
      end try`);
    },
    currentTabText: async () => {
      return await runJSInActiveTab(`document.body.innerText`);
    },
    runJSInActiveTab,
  };
};

const MicrosoftEdge = Chromium("Microsoft Edge");
const Brave = Chromium("Brave Browser");
const GoogleChrome = Chromium("Google Chrome");
const Vivaldi = Chromium("Vivaldi");
const Opera = Chromium("Opera");
const Yandex = Chromium("Yandex");
const OperaGX = Chromium("Opera GX");
const OperaNeon = Chromium("Opera Neon");
const Epic = Chromium("Epic");
const OperaBeta = Chromium("Opera Beta");
const OperaDeveloper = Chromium("Opera Developer");
const MicrosoftEdgeBeta = Chromium("Microsoft Edge Beta");
const MicrosoftEdgeCanary = Chromium("Microsoft Edge Canary");
const MicrosoftEdgeDev = Chromium("Microsoft Edge Dev");
const BraveBeta = Chromium("Brave Browser Beta");
const BraveDev = Chromium("Brave Browser Dev");
const BraveNightly = Chromium("Brave Browser Nightly");
const GoogleChromeBeta = Chromium("Google Chrome Beta");
const GoogleChromeCanary = Chromium("Google Chrome Canary");
const GoogleChromeDev = Chromium("Google Chrome Dev");
const Blisk = Chromium("Blisk");
const Iron = Chromium("Iron");
const Maxthon = Chromium("Maxthon");
const MaxthonBeta = Chromium("Maxthon Beta");

export default Chromium;
export {
  MicrosoftEdge,
  Brave,
  GoogleChrome,
  Vivaldi,
  Opera,
  Yandex,
  OperaGX,
  OperaNeon,
  Epic,
  OperaBeta,
  OperaDeveloper,
  MicrosoftEdgeBeta,
  MicrosoftEdgeCanary,
  MicrosoftEdgeDev,
  BraveBeta,
  BraveDev,
  BraveNightly,
  GoogleChromeBeta,
  GoogleChromeCanary,
  GoogleChromeDev,
  Blisk,
  Iron,
  Maxthon,
  MaxthonBeta,
};
