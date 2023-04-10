import {
  Clipboard,
  Detail,
  getFrontmostApplication,
  getSelectedText,
  LocalStorage,
  showToast,
  Toast,
  useUnstableAI,
} from "@raycast/api";
import { ERRORTYPE, useFileContents } from "./utils/file-utils";
import ResponseActions from "./ResponseActions";
import * as os from "os";
import * as fs from "fs";
import { useEffect, useState } from "react";
import {
  CalendarDuration,
  filterString,
  getCurrentDate,
  getCurrentTime,
  getUpcomingCalendarEvents,
} from "./utils/calendar-utils";
import {
  getTextOfWebpage,
  getCurrentURL,
  SupportedBrowsers,
  getTrackNames,
  getCurrentTrack,
  getLastNote,
  getInstalledApplications,
  getLastEmail,
  getSafariTopSites,
  getJSONResponse,
  getWeatherData,
} from "./utils/context-utils";

export default function CommandResponse(props: {
  commandName: string;
  prompt: string;
  minNumFiles?: number;
  acceptedFileExtensions?: string[];
  skipMetadata?: boolean;
  skipAudioDetails?: boolean;
}) {
  const { commandName, prompt, minNumFiles, acceptedFileExtensions, skipMetadata, skipAudioDetails } = props;

  const [currentApplication, setCurrentApplication] = useState<string>("");
  const [currentURL, setCurrentURL] = useState<string>();
  const [currentTabText, setCurrentTabText] = useState<string>();
  const [selectedText, setSelectedText] = useState<string>();
  const [clipboardText, setClipboardText] = useState<string>();
  const [musicTracks, setMusicTracks] = useState<string>();
  const [currentTrack, setCurrentTrack] = useState<string>();
  const [lastNote, setLastNote] = useState<string>();
  const [lastEmail, setLastEmail] = useState<string>();
  const [installedApps, setInstalledApps] = useState<string>();
  const [fileAICommands, setFileAICommands] = useState<string>();
  const [safariTopSites, setSafariTopSites] = useState<string>();
  const [location, setLocation] = useState<string>();
  const [todayWeather, setTodayWeather] = useState<string>();
  const [weekWeather, setWeekWeather] = useState<string>();
  const [currentTime] = useState<string>(getCurrentTime());
  const [date] = useState<string>(getCurrentDate());
  const [todayEvents, setTodayEvents] = useState<string>("");
  const [weekEvents, setWeekEvents] = useState<string>("");
  const [monthEvents, setMonthEvents] = useState<string>("");
  const [yearEvents, setYearEvents] = useState<string>("");
  const [todayReminders, setTodayReminders] = useState<string>("");
  const [weekReminders, setWeekReminders] = useState<string>("");
  const [monthReminders, setMonthReminders] = useState<string>("");
  const [yearReminders, setYearReminders] = useState<string>("");
  const [loadingData, setLoadingData] = useState<boolean>(true);

  const { selectedFiles, contentPrompts, loading, errorType } =
    minNumFiles != undefined && minNumFiles > 0
      ? useFileContents(minNumFiles, acceptedFileExtensions, skipMetadata, skipAudioDetails)
      : { selectedFiles: [], contentPrompts: [], loading: false, errorType: undefined };

  const replacements: { [key: string]: () => void } = {
    // Context Data
    "{{currentApplication}}": async () => {
      const app = await getFrontmostApplication();
      setCurrentApplication(app.name);
    },
    "{{currentURL}}": async () => {
      let appName = currentApplication;
      if (!currentApplication) {
        const app = await getFrontmostApplication();
        appName = app.name;
        setCurrentApplication(appName);
      }

      if (SupportedBrowsers.includes(appName)) {
        const URL = await getCurrentURL(appName);
        setCurrentURL(URL);
      } else {
        setCurrentURL("");
      }
    },
    "{{currentTabText}}": async () => {
      let appName = currentApplication;
      if (!currentApplication) {
        const app = await getFrontmostApplication();
        appName = app.name;
        setCurrentApplication(appName);
      }

      if (SupportedBrowsers.includes(appName)) {
        const URL = await getCurrentURL(appName);
        const URLText = await getTextOfWebpage(URL);
        setCurrentTabText(filterString(URLText));
      } else {
        setCurrentTabText("");
      }
    },
    "{{selectedText}}": async () => setSelectedText((await getSelectedText()).substring(0, 3000)),
    "{{clipboardText}}": async () => {
      const text = await Clipboard.readText();
      setClipboardText(filterString(text as string));
    },
    "{{musicTracks}}": async () => setMusicTracks(filterString(await getTrackNames())),
    "{{currentTrack}}": async () => setCurrentTrack(await getCurrentTrack()),
    "{{lastNote}}": async () => setLastNote(filterString(await getLastNote())),
    "{{lastEmail}}": async () => setLastEmail(filterString(await getLastEmail())),
    "{{installedApps}}": async () => setInstalledApps(filterString(filterString(await getInstalledApplications()))),
    "{{fileAICommands}}": async () => {
      const storedItems = await LocalStorage.allItems();
      setFileAICommands(filterString(Object.keys(storedItems).join(", ")));
    },
    "{{safariTopSites}}": async () => setSafariTopSites(await getSafariTopSites()),

    // API Data
    "{{location}}": async () => {
      const jsonObj = getJSONResponse("https://get.geojs.io/v1/ip/geo.json");
      const city = jsonObj["city"];
      const region = jsonObj["region"];
      const country = jsonObj["country"];
      setLocation(`${city}, ${region}, ${country}`);
    },
    "{{todayWeather}}": async () => setTodayWeather(getWeatherData(1) as unknown as string),
    "{{weekWeather}}": async () => setWeekWeather(getWeatherData(7) as unknown as string),

    // Calendar Data
    "{{todayEvents}}": async () => setTodayEvents(filterString(await getUpcomingCalendarEvents(CalendarDuration.DAY))),
    "{{weekEvents}}": async () => setWeekEvents(filterString(await getUpcomingCalendarEvents(CalendarDuration.WEEK))),
    "{{monthEvents}}": async () =>
      setMonthEvents(filterString(await getUpcomingCalendarEvents(CalendarDuration.MONTH))),
    "{{yearEvents}}": async () => setYearEvents(filterString(await getUpcomingCalendarEvents(CalendarDuration.YEAR))),
    "{{todayReminders}}": async () =>
      setTodayReminders(filterString(await getUpcomingCalendarEvents(CalendarDuration.DAY))),
    "{{weekReminders}}": async () =>
      setWeekReminders(filterString(await getUpcomingCalendarEvents(CalendarDuration.WEEK))),
    "{{monthReminders}}": async () =>
      setMonthReminders(filterString(await getUpcomingCalendarEvents(CalendarDuration.MONTH))),
    "{{yearReminders}}": async () =>
      setYearReminders(filterString(await getUpcomingCalendarEvents(CalendarDuration.YEAR))),
  };

  useEffect(() => {
    for (const key in replacements) {
      if (prompt.includes(key)) {
        Promise.resolve(replacements[key]());
      }
    }
  }, []);

  if (
    loadingData == true &&
    (!prompt.includes("{{todayEvents}}") || todayEvents.length > 0) &&
    (!prompt.includes("{{weekEvents}}") || weekEvents.length > 0) &&
    (!prompt.includes("{{monthEvents}}") || monthEvents.length > 0) &&
    (!prompt.includes("{{yearEvents}}") || yearEvents.length > 0) &&
    (!prompt.includes("{{todayReminders}}") || todayReminders.length > 0) &&
    (!prompt.includes("{{weekReminders}}") || weekReminders.length > 0) &&
    (!prompt.includes("{{monthReminders}}") || monthReminders.length > 0) &&
    (!prompt.includes("{{yearReminders}}") || yearReminders.length > 0) &&
    (!prompt.includes("{{currentApplication}}") || currentApplication.length > 0) &&
    (!prompt.includes("{{currentURL}}") || currentURL != undefined) &&
    (!prompt.includes("{{currentTabText}}") || currentTabText != undefined) &&
    (!prompt.includes("{{selectedText}}") || selectedText != undefined) &&
    (!prompt.includes("{{clipboardText}}") || clipboardText != undefined) &&
    (!prompt.includes("{{musicTracks}}") || musicTracks != undefined) &&
    (!prompt.includes("{{currentTrack}}") || currentTrack != undefined) &&
    (!prompt.includes("{{lastNote}}") || lastNote != undefined) &&
    (!prompt.includes("{{lastEmail}}") || lastEmail != undefined) &&
    (!prompt.includes("{{fileAICommands}}") || fileAICommands != undefined) &&
    (!prompt.includes("{{safariTopSites}}") || safariTopSites != undefined) &&
    (!prompt.includes("{{location}}") || location != undefined) &&
    (!prompt.includes("{{todayWeather}}") || todayWeather != undefined) &&
    (!prompt.includes("{{weekWeather}}") || weekWeather != undefined) &&
    (!prompt.includes("{{installedApps}}") || installedApps != undefined)
  ) {
    setLoadingData(false);
  }

  const contentPromptString = contentPrompts.join("\n");
  const substitutedPrompt = prompt
    /* File Data Substitutions */
    .replaceAll("{{files}}", selectedFiles ? selectedFiles?.join(", ") : "")
    .replaceAll("{{contents}}", contentPromptString)
    .replaceAll("{{fileNames}}", selectedFiles ? selectedFiles.map((path) => path.split("/").at(-1)).join(", ") : "")
    .replace(
      "{{metadata}}",
      selectedFiles
        ? selectedFiles
            .map(
              (path) =>
                `${path}:\n${Object.entries(fs.lstatSync(path))
                  .map((entry) => `${entry[0]}:entry[1]`)
                  .join("\n")}`
            )
            .join("\n\n")
        : ""
    )

    /* Calendar Data Substitutions */
    .replaceAll("{{time}}", currentTime)
    .replaceAll("{{date}}", date)
    .replaceAll("{{todayEvents}}", todayEvents)
    .replaceAll("{{weekEvents}}", weekEvents)
    .replaceAll("{{monthEvents}}", monthEvents)
    .replaceAll("{{yearEvents}}", yearEvents)
    .replaceAll("{{todayReminders}}", todayReminders)
    .replaceAll("{{weekReminders}}", weekReminders)
    .replaceAll("{{monthReminders}}", monthReminders)
    .replaceAll("{{yearReminders}}", yearReminders)

    /* Context Data Substitutions */
    .replaceAll("{{currentApplication}}", currentApplication)
    .replaceAll("{{currentURL}}", currentURL == undefined ? "" : currentURL)
    .replaceAll("{{currentTabText}}", currentTabText == undefined ? "" : currentTabText)
    .replaceAll("{{selectedText}}", selectedText == undefined ? "" : selectedText)
    .replaceAll("{{clipboardText}}", clipboardText == undefined ? "" : clipboardText)
    .replaceAll("{{musicTracks}}", musicTracks == undefined ? "" : musicTracks)
    .replaceAll("{{currentTrack}}", currentTrack == undefined ? "" : currentTrack)
    .replaceAll("{{lastNote}}", lastNote == undefined ? "" : lastNote)
    .replaceAll("{{lastEmail}}", lastEmail == undefined ? "" : lastEmail)
    .replaceAll("{{installedApps}}", installedApps == undefined ? "" : installedApps)
    .replaceAll("{{fileAICommands}}", fileAICommands == undefined ? "" : fileAICommands)
    .replaceAll("{{topSites}}", safariTopSites == undefined ? "" : safariTopSites)
    .replaceAll("{{location}}", location == undefined ? "" : location)
    .replaceAll("{{todayWeather}}", todayWeather == undefined ? "" : todayWeather)
    .replaceAll("{{weekWeather}}", weekWeather == undefined ? "" : weekWeather)

    /* System Data Substitutions */
    .replaceAll("{{user}}", os.userInfo().username)
    .replaceAll("{{homedir}}", os.userInfo().homedir);
  const fullPrompt = (substitutedPrompt + contentPromptString).replace(/{{END}}(\n|.)*/, "");
  const { data, isLoading, revalidate } = useUnstableAI(fullPrompt, {
    execute: !loadingData && ((minNumFiles != undefined && minNumFiles == 0) || contentPrompts.length > 0),
  });

  if (errorType) {
    let errorMessage = "";
    if (errorType == ERRORTYPE.FINDER_INACTIVE) {
      errorMessage = "Can't get selected files";
    } else if (errorType == ERRORTYPE.MIN_SELECTION_NOT_MET) {
      errorMessage = `Must select at least ${minNumFiles} file${minNumFiles == 1 ? "" : "s"}`;
    } else if (errorType == ERRORTYPE.INPUT_TOO_LONG) {
      errorMessage = "Input too large";
    }

    showToast({
      title: "Failed Error Detection",
      message: errorMessage,
      style: Toast.Style.Failure,
    });
    return null;
  }

  const text = `# ${commandName}\n${
    data ? data : minNumFiles != undefined && minNumFiles == 0 ? "Loading response..." : "Analyzing files..."
  }`;
  return (
    <Detail
      isLoading={
        loading ||
        isLoading ||
        loadingData ||
        (minNumFiles != undefined && minNumFiles != 0 && contentPrompts.length == 0)
      }
      markdown={text}
      navigationTitle={commandName}
      actions={
        <ResponseActions
          commandSummary="Response"
          responseText={text}
          promptText={fullPrompt}
          reattempt={revalidate}
          files={selectedFiles}
        />
      }
    />
  );
}
