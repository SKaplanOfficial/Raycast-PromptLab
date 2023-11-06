import { getFrontmostApplication, getPreferenceValues } from "@raycast/api";
import { ExtensionPreferences, JSONObject } from "./types";
import { runAppleScript } from "@raycast/utils";
import {
  Arc,
  Blisk,
  Brave,
  BraveBeta,
  BraveDev,
  BraveNightly,
  Browser,
  Chromium,
  Epic,
  GoogleChrome,
  GoogleChromeBeta,
  GoogleChromeCanary,
  GoogleChromeDev,
  Iron,
  Maxthon,
  MaxthonBeta,
  MicrosoftEdge,
  MicrosoftEdgeBeta,
  MicrosoftEdgeCanary,
  MicrosoftEdgeDev,
  OmniWeb,
  Opera,
  OperaBeta,
  OperaDeveloper,
  OperaGX,
  OperaNeon,
  Orion,
  Safari,
  SigmaOS,
  Vivaldi,
  Yandex,
  iCab,
  utils,
} from "./browsers";

/**
 * Removes extraneous symbols from a string and limits it to (by default) 3000 characters.
 *
 * @param str The string to filter.
 * @param cutoff The length to limit the string to, defaults to 3000.
 * @returns The filtered string.
 */
export const filterString = (str: string, cutoff?: number): string => {
  /* Removes unnecessary/invalid characters from strings. */
  const preferences = getPreferenceValues<ExtensionPreferences>();
  if (preferences.condenseAmount == "high") {
    // Remove some useful characters for the sake of brevity
    return str
      .replaceAll(/[^A-Za-z0-9,.?!\-'()/[\]{}@: ~\n\r<>]/g, "")
      .replaceAll('"', "'")
      .substring(0, cutoff || str.length);
  } else if (preferences.condenseAmount == "medium") {
    // Remove uncommon characters
    return str
      .replaceAll(/[^A-Za-z0-9,.?!\-'()/[\]{}@: ~\n\r<>+*&|]/g, "")
      .replaceAll('"', "'")
      .substring(0, cutoff || str.length);
  } else if (preferences.condenseAmount == "low") {
    // Remove all characters except for letters, numbers, and punctuation
    return str
      .replaceAll(/[^A-Za-z0-9,.?!\-'()/[\]{}@:; ~\n\r\t<>%^$~+*_&|]/g, "")
      .replaceAll('"', "'")
      .substring(0, cutoff || str.length);
  } else {
    // Just remove quotes and cut off at the limit
    return str.replaceAll('"', "'").substring(0, cutoff || str.length);
  }
};

/**
 * The browsers from which the current URL can be obtained.
 */
export const SupportedBrowsers = [
  Arc,
  Safari,
  SigmaOS,
  iCab,
  Orion,
  OmniWeb,
  Chromium("Chromium"),
  Blisk,
  Brave,
  BraveBeta,
  BraveDev,
  BraveNightly,
  Epic,
  GoogleChrome,
  GoogleChromeBeta,
  GoogleChromeCanary,
  GoogleChromeDev,
  Iron,
  Maxthon,
  MaxthonBeta,
  MicrosoftEdge,
  MicrosoftEdgeBeta,
  MicrosoftEdgeCanary,
  MicrosoftEdgeDev,
  Opera,
  OperaBeta,
  OperaDeveloper,
  OperaGX,
  OperaNeon,
  Vivaldi,
  Yandex,
];

/**
 * Gets the active browser.
 * @returns A promise resolving to the active browser, or undefined if another kind of application is active.
 */
export const getActiveBrowser = async (): Promise<Browser | undefined> => {
  const app = (await getFrontmostApplication()).name || "";
  return SupportedBrowsers.find((browser) => browser.name === app);       
}

/**
 * Executes the specified JavaScript in the active tab of the target browser.
 * @param script The JavaScript to execute.
 * @param browserName The name of the browser to execute the script in. If not specified, the active browser will be used.
 * @returns A promise resolving to the result of executing the JavaScript.
 */
export const runJSInActiveTab = async (script: string, browserName?: string) => {
  let browser: Browser | undefined;
  if (browserName) {
    browser = SupportedBrowsers.find((browser) => browser.name === browserName);
  } else {
    browser = await getActiveBrowser();
  }

  if (browser) {
    return await browser.runJSInActiveTab(script);
  }
  return "";
};

/**
 * Gets the JSON objects returned from a URL.
 *
 * @param URL The url to a .json document.
 * @returns The JSON as a {@link JSONObject}.
 */
export const getJSONResponse = async (URL: string): Promise<JSONObject> => {
  const raw = await utils.getURLHTML(URL);
  return JSON.parse(raw);
};

/**
 * Gets the English transcript of a YouTube video specified by its ID.
 * @param videoId The ID of the YouTube video.
 * @returns A promise resolving to the transcript as a string, or "No transcript available." if there is no transcript.
 */
export const getYouTubeVideoTranscriptById = async (videoId: string): Promise<string> => {
  const html = await utils.getURLHTML(`https://www.youtube.com/watch?v=${videoId}`);
  const captionsJSON = JSON.parse(html.split(`"captions":`)?.[1]?.split(`,"videoDetails"`)?.[0]?.replace("\n", ""))[
    "playerCaptionsTracklistRenderer"
  ];

  if (!("captionTracks" in captionsJSON)) {
    return "No transcript available.";
  }

  const title = html.matchAll(/title":"((.| )*?),"lengthSeconds/g).next().value?.[1];
  const captionTracks = captionsJSON["captionTracks"];
  const englishCaptionTrack = captionTracks.find((track: JSONObject) => track["languageCode"] === "en");
  if (!englishCaptionTrack) {
    return "No transcript available.";
  }

  const transcriptText = await utils.getTextOfWebpage(englishCaptionTrack["baseUrl"]);
  return filterString(`Video Title: ${title}\n\nTranscript:\n${transcriptText}`);
};

/**
 * Gets the English transcript of a YouTube video specified by its URL.
 * @param videoURL The URL of the YouTube video.
 * @returns A promise resolving to the transcript as a string, or "No transcript available." if there is no transcript.
 */
export const getYouTubeVideoTranscriptByURL = async (videoURL: string): Promise<string> => {
  const videoId = videoURL.split("v=")[1]?.split("&")[0];
  return getYouTubeVideoTranscriptById(videoId);
};

/**
 * Gets the ID of the first YouTube video matching the search text.
 * @param searchText The text to search for.
 * @returns The ID of the first matching video.
 */
export const getMatchingYouTubeVideoID = async (searchText: string): Promise<string> => {
  const html = await utils.getURLHTML(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchText)}`);
  const videoID = html.matchAll(/videoId\\x22:\\x22(.*?)\\x22,/g).next().value?.[1];
  return videoID;
};

/**
 * Gets the name of the currently playing track or stream of Music.app.
 *
 * @returns A promise resolving to the track/stream name as a string.
 */
export const getCurrentTrack = async (): Promise<string> => {
  return runAppleScript(`try
    tell application "Music"
      set trackName to current stream title
      if trackName is missing value then
        set trackName to name of current track
      end if
      return trackName
    end tell
  end try`);
};

/**
 * Gets the list of track names in Music.app.
 *
 * @returns A promise resolving to the list of track names as a string.
 */
export const getTrackNames = async (): Promise<string> => {
  return runAppleScript(`try
    tell application "Music"
      get name of tracks
    end tell
  end try`);
};

/**
 * Gets the plaintext of the most recently edited note.
 *
 * @returns A promise resolving to the note's plaintext as a string.
 */
export const getLastNote = async (): Promise<string> => {
  return runAppleScript(`try
    tell application "Notes"
      get plaintext of note 1
    end tell
  end try`);
};

/**
 * Gets a list of currently installed applications.
 *
 * @returns A promise resolving to the list of apps as a string.
 */
export const getInstalledApplications = async (): Promise<string> => {
  return runAppleScript(`use framework "Foundation"

    property ca : current application
    property theResult : ""
    property query : missing value
    
    try
      set result to ""
      ca's NSNotificationCenter's defaultCenter's addObserver:me selector:"queryDidFinish:" |name|:"NSMetadataQueryDidFinishGatheringNotification" object:(missing value)
      set predicate to ca's NSPredicate's predicateWithFormat:"kMDItemContentType == 'com.apple.application-bundle'"
      set query to ca's NSMetadataQuery's alloc()'s init()
      query's setPredicate:predicate
      query's setSearchScopes:["/Applications", "/Users/"]
      query's startQuery()
      
      repeat while theResult is ""
        delay 0.1
      end repeat
      
      return text 1 thru ((length of theResult) - 2) of theResult
    end try
    
    on queryDidFinish:theNotification
      global result
      set queryResults to theNotification's object()'s results()
      set internalResult to ""
      repeat with object in queryResults
        set itemName to (object's valueForAttribute:("kMDItemFSName")) as text
        set appName to (text 1 thru ((length of itemName) - 4) of itemName)
        if appName does not contain "." and appName does not contain "_" and appName does not end with "Agent" and appName does not end with "Assistant" then
          set internalResult to internalResult & appName & ", "
        end if
      end repeat
      set theResult to internalResult
    end queryDidFinish:`);
};

/**
 * Gets the subject, sender, and content of the most recently received email in Mail.app.
 *
 * @returns A promise resolving to the email as a string.
 */
export const getLastEmail = async (): Promise<string> => {
  return runAppleScript(`try
    tell application "Mail"
      set latestMessage to ""
      set theMailboxes to mailboxes of accounts whose name does not contain "Deleted" and name does not contain "Archive" and name does not contain "Sent"
      
      set newestDate to missing value
      set newestMessage to missing value
      repeat with theAccount in theMailboxes
        repeat with theMailbox in theAccount
          if (count of (messages of theMailbox)) > 0 then
            set theMessage to message 1 of theMailbox
            set messageDate to theMessage's date received
            if newestDate is missing value or messageDate > newestDate then
              set newestDate to messageDate
              set newestMessage to theMessage
            end if
          end if
        end repeat
      end repeat
      
      set messageSubject to newestMessage's subject
      set messageSender to newestMessage's sender
      set messageContent to newestMessage's content
      return "Subject: " & messageSubject & "\\nFrom: " & messageSender & "\\nContent: " & messageContent
    end tell
  end try`);
};

/**
 * Gets the weather forecast from open-meteo.com.
 *
 * @param days The number of days to get the forecast for (either 1 or 7)
 * @returns The forecast as a JSON object.
 */
export const getWeatherData = async (days: number): Promise<JSONObject> => {
  const jsonObj = await getJSONResponse("https://get.geojs.io/v1/ip/geo.json");
  const latitude = jsonObj["latitude"];
  const longitude = jsonObj["longitude"];
  const timezone = (jsonObj["timezone"] as string).replace("/", "%2F");
  return getJSONResponse(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,rain_sum,snowfall_sum,precipitation_hours&current_weather=true&windspeed_unit=ms&forecast_days=${days.toString()}&timezone=${timezone}`,
  );
};

/**
 * Gets the computer's name.
 *
 * @returns A promise resolving to the computer name as a string.
 */
export const getComputerName = async () => {
  return await runAppleScript(`use scripting additions
  return computer name of ((system info) as record)`);
};

/**
 * Gets the current Finder directory.
 * @returns A promise resolving to the path of the current directory as a string.
 */
export const getCurrentDirectory = async () => {
  return await runAppleScript(`tell application "Finder"
    return POSIX path of (insertion location as alias)
  end tell`);
};

/**
 * Gets the application that owns the menubar.
 * @param includePaths Whether to include the path of the application.
 * @returns A promise resolving to the name of the application as a string, or an object containing the name and path if includePaths is true.
 */
export const getMenubarOwningApplication = async (
  includePaths?: boolean,
): Promise<string | { name: string; path: string }> => {
  const app = await runAppleScript(`use framework "Foundation"
  use scripting additions
  set workspace to current application's NSWorkspace's sharedWorkspace()
  set runningApps to workspace's runningApplications()
  
  set targetApp to missing value
  repeat with theApp in runningApps
    if theApp's ownsMenuBar() then
      set targetApp to theApp
      exit repeat
    end if
  end repeat
  
  if targetApp is missing value then
    return ""
  else
    ${
      includePaths
        ? `return {targetApp's localizedName() as text, targetApp's bundleURL()'s fileSystemRepresentation() as text}`
        : `return targetApp's localizedName() as text`
    }
  end if`);

  if (includePaths) {
    const data = app.split(", ");
    return { name: data[0], path: data[1] };
  }
  return app;
};
