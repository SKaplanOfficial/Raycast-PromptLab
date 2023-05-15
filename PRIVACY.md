# PromptLab Privacy Policy

Last Updated: 2023-05-13

## Introduction

PromptLab is a third-party extension for [Raycast](https://raycast.com) that allows you to create custom commands and placeholders. This privacy policy describes how PromptLab collects, uses, and shares information about you and your computer.

## Key Points

- PromptLab lets you create powerful commands using custom placeholders, action scripts, APIs, and more.
- To deliver its core functionality, PromptLab must access various kinds of information about you and your computer.
- Information is only accessed when you explicitly instruct PromptLab to do so, such as when you run a command that utilizes a placeholder.
- Information is not retained by PromptLab unless you willingly provide it, such as when you submit a command to the PromptLab Store.

## Data Collection and Retention

PromptLab does not collect nor retain any information about you or your computer unless you willingly provide such information, such as when you submit a command to the PromptLab Store. PromptLab's commands and placeholder features are supported by a combination of third-party AI models, on-device services, and third-party APIs. Third-party services may collect information about you and your computer, but PromptLab does not collect or retain any such information. Refer to the privacy policies of the third-party services for more information.

PromptLab allows you to configure custom model endpoints for AI inferences. If you choose to use this feature, you will need to provide authentication information for the model endpoint, such as an API key. The authentication information you provide is stored using Raycast's password preference API, and is not accessible to PromptLab or any third-party services.

Below is a table of all information utilized by PromptLab, along with a description of how it is used.

| Information | Description | How Obtained | Usage | Retention |
| --- | --- | --- | --- | --- |
| Calendar Events | The list of upcoming events in your calendar, using Calendar.app | Obtained via Apple's EventKit framework | Used to provide event names and times for use in commands. Accessed only when the `{{todayEvents}}`, `{{weekEvents}}`, `{{monthEvents}}`, or `{{yearEvents}}` placeholders are used. | Not Retained |
| Clipboard Text | The text content of your clipboard | Obtained via Raycast's Clipboard API | Used to provide the current clipboard text for use in commands. Accessed only when the `{{clipboardText}}` placeholder is used. | Not Retained |
| Device Information | The name and hostname of your computer | Obtained via AppleScript and NodeJS APIs | Used to provide the device name and hostname for use in commands. Accessed only when the `{{computerName}}` or `{{hostname}}` placeholders are used. | Not Retained |
| Current Application | The name of the application currently in focus | Obtained via AppleScript | Used to provide the current application name for use in commands. Accessed only when the `{{currentApplication}}` placeholder is used. | Not Retained |
| Current Finder Directory | The path of the directory currently in focus in Finder | Obtained via AppleScript | Used to provide the current Finder directory path for use in commands. Accessed only when the `{{currentDirectory}}` placeholder is used. | Not Retained |
| Current Tab Information | The URL, title, and visible text content of the current tab in supported browsers | Obtained via AppleScript | Used to provide the current tab information for use in commands. Accessed only when the `{{currentURL}}` or `{{currentTabText}}` placeholders are used. | Not Retained |
| File Information | The path, name, extension, metadata, contents, image vision insights, and sound analysis insights of files | Obtained via AppleScript | Used to provide the current file information for use in commands. Accessed when you run commands that utilize one or more selected files, or when you use the `{{contents}}`, `{{fileNames}}`, `{{file:path}}`, `{{files}}`, or `{{metadata}}` placeholders. | Not Retained |
| Installed Applications | The list of applications installed on your computer | Obtained via Spotlight search | Used to provide application names for use in commands. Accessed only when the `{{installedApps}}` placeholder is used. | Not Retained |
| Last Email Message | The text content of the last email message you received in Mail.app | Obtained via AppleScript | Used to provide the email message content for use in commands. Accessed only when the `{{lastEmail}}` placeholder is used. | Not Retained |
| Last Note | The text content of the last note you created in Notes.app | Obtained via AppleScript | Used to provide the note content for use in commands. Accessed only when the `{{lastNote}}` placeholder is used. | Not Retained |
| Location | Your approximate geographic location and address | Obtained via your IP address as well as through on-device location services | Used to provide weather information and nearby locations for use in commands | Not Retained |
| Music Track Names | The list of the names of the tracks in your Music.app library | Obtained via AppleScript | Used to provide track names for use in commands. Accessed only when the `{{musicTracks}}` placeholder is used. | Not Retained |
| Reminders | The list of upcoming reminders in using Reminders.app | Obtained via Apple's EventKit framework | Used to provide reminder names and times for use in commands. Accessed only when the `{{todayReminders}}`, `{{weekReminders}}`, `{{monthReminders}}`, or `{{yearReminders}}` placeholders are used. | Not Retained |
| Safari Bookmarks | The list of bookmarked URLs in Safari | Obtained via Safari's Bookmarks.plist file | Used to provide bookmarked URLs for use in commands. Accessed only when the `{{safariBookmarks}}` placeholder is used. | Not Retained |
| Safari Top Sites | The list of top site URLs in Safari | Obtained via Safari's TopSites.plist file | Used to provide top sites for use in commands. Accessed only when the `{{safariTopSites}}` placeholder is used. | Not Retained |
| Selected Text | The currently selected text in the active application | Obtained via Raycast's Selected Text API | Used to provide the selected text for use in commands. Accessed only when the `{{selectedText}}` placeholder is used. | Not Retained |
| Username and Home Directory | Your macOS username and home directory path | Obtained via AppleScript and NodeJS APIs | Used to provide your username and home directory path for use in commands. Accessed only when the `{{user}}` or `{{homedir}}` placeholders are used. | Not Retained |
| Weather | The current weather conditions at your approximate geographic location | Obtained via third-party weather APIs | Used to provide weather information for use in commands | Not Retained |

## Command Privacy and the PromptLab Store

PromptLab does not significantly limit the content of prompts, action scripts, descriptions, or other information fields of commands that you create. You may choose to include personal information in these fields, but you should not share any commands that contain personal information to the PromptLab Store. Commands found to contain personal information will be removed from the PromptLab Store.

Commands may utilize third-party services or custom scripts to provide functionality. These services and scripts may collect information about you and your computer. Commands that utilize these features may be uploaded to the PromptLab Store, but will be reviewed to ensure that they do not pose a security or privacy risk to users. Commands found to pose a security or privacy risk will be removed from the PromptLab Store. The details for every command, including its prompt, placeholders, action scripts, and descriptions, are publicly available on the PromptLab Store.

## Use Of Third-Party Services

Below is a list of third-party services used by PromptLab, along with links to their privacy policies and a description of how they are used by PromptLab.

| Third-Party Service | Privacy Policy | Relevance To PromptLab |
| --- | --- | --- |
| Apple | [https://www.apple.com/legal/privacy/en-ww/](https://www.apple.com/legal/privacy/en-ww/) | Location services, Spotlight, and other on-device services |
| GeoJS | [https://www.geojs.io/privacy/](https://www.geojs.io/privacy/) | Location services |
| OpenAI | [https://openai.com/privacy/](https://openai.com/privacy/) | Optional AI model endpoints |
| Open-Meteo | [https://open-meteo.com/en/terms](https://open-meteo.com/en/terms) | Weather Data |
| YouTube | [https://policies.google.com/privacy](https://policies.google.com/privacy) | YouTube video transcripts |

## Contact

If you have any questions or concerns about this privacy policy, please contact me at [stephen.kaplan@maine.edu](mailto:stephen.kaplan@maine.edu).