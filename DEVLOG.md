# PromptLab DevLog - A More Detailed ChangeLog

## v1.1.1 Release

### 2023-07-27

- Add support for additional browsers (e.g. Dev/Beta/Canary versions of Chrome, Edge, and Brave, Opera GX, etc.)
- Added support for parsing Pages and Keynote documents.
- Added support for parsing MS Office and Apple Numbers documents.
- Added `{{screenContent}}` and `{{windowContent}}` placeholders for getting image vision data for the user's entire screen or the active window, respectively.
- Added horizon detection and corresponding command setting.
  - Added `{{imageHorizon}}` placeholder.

### 2023-07-19

- Added ability to modify action keybindings in the advanced settings

### 2023-07-17

- Added Dialog Window command response view
- Fixed bug where list and grid output views would fail to display any content due to condensing of symbols
- Fixed bug where command-specific temperature settings would not be applied
- Fixed bug where old-style URL placeholders using HTTP instead of HTTPS would not be processed.

## v1.1.0 Release

### 2023-07-15

- Fixed bug where event/reminder placeholders require both event and reminder permissions, even if only one is used

### 2023-06-27

- Added advanced settings JSON file & integration throughout the extension
  - Control which actions are available in the action menu
  - Control default command/model/chat settings
  - Control placeholder processing

### 2023-06-25

- Added setting for specifying additional custom placeholder file paths
- Added placeholder detection when writing prompts + information about detected placeholders in the prompt info box.
- Added support for Orion browser
- Added action to copy command ID
- PromptLab command placeholders can now use the command ID instead of the command name
- URL placeholders now support `raw` parameter to return the raw HTML instead of the visible text
- Moved many scripts into the `scripts` folder as `.scpt` files -- more efficient + easier to edit
- Switched command QuickLinks to use command IDs. Name-based QuickLinks are still supported.

### 2023-06-24

- Added conditional prompting using filetype placeholders
  - {{images:...}} - Content (including other placeholders) will only be evaluated if there is at least on selected image files
  - Other file categories: {{textfiles:...}}, {{videos:...}}, {{audio:...}}
  - For image, text, audio, and video file extensions, use {{ext:...}} to single out a specific file extension, e.g. {{svg:...}} or {{mov:...}}
    - Also supports {{pdf:...}}
  - Conditional prompting have other placeholders nested inside them, e.g. {{images:{{url:<https://www.example.com}}}}>
    - Inner placeholders will only be evaluated if the condition is met (e.g. if there is at least one image file)
- Added Custom Placeholders stored in supportPath/custom_placeholders.json
- Added action to edit the custom placeholders file
- Added Placeholders Guide and an action to open it
- Added automatic detection of placeholders in prompts
  - If a placeholder is detected, the info box for the prompt will show the detected placeholder, its description, and an example

### 2023-06-22

- Redesigned the placeholders system to be more efficient and more versatile
  - Added several new placeholders
    - {{day locale="en-US"}} - Returns the name of the current day of the week
    - {{jxa:...}} - Run a JXA script and return the output
    - {{shortcuts}} - List of names of all Siri Shortcuts
    - {{shortcut:shortcutName:input}} - Run a Siri Shortcut with the given input and return the output
    - {{uuid}} - Generate a UUID
    - {{usedUUIDs}} - List of all UUIDs generated via the {{uuid}} placeholder thus far
  - Expanded functionality of many placeholders by adding support for optional customizations
    - {{date format="d MMMM, YYYY"}} - Added optional format parameter
    - {{time format="h:mm a"}} - Added optional format parameter
  - Expanded persistent variable support with new directives
    - {{set x:y}} - Set the persistent variable x to y
    - {{get x}} - Get the value of the persistent variable x
    - {{reset x}} - Reset the persistent variable x to its initial value
    - {{delete x}} - Delete the persistent variable x
    - {{vars}} - List of stored persistent variable names
  - Now using bulkApply strategy that uses memoization to improve performance, especially when using multiple placeholders in a single command
- Added settings for displaying icons & icon colors in menu bar menu
- Added settings for displaying core PromptLab commands in menu bar menu
- Added settings for displaying favorites & categories in menu bar menu
- Fixed placeholders for events and reminders not working on macOS Ventura

### 2023-05-21

- Added "PromptLab Menu Bar" menu-bar command
- Added option to show a command in the menu bar menu
- Added option to speak responses
- Added {{prompt:text}} placeholder

## v1.0.0 Release

### 2023-05-17

#### v1.1.0

- Add ability to edit chat settings, such as renaming the chat, changing the prompt, and setting the chat as a favorite
- Added ability to delete chats
- Added ability to export chats
- Added ability to add/remove context data to chats
- Added ability to delete chats individually or in bulk
- Added chat statistics
- Added {{nearbyLocations:searchTerm}} placeholder
  - Returns a list of nearby location addresses matching the search term

#### v1.0.0

- Fixed bug where Quicklinks would fail if your command contained "&"
- Adjusted how symbols are condensed in prompt input (now better preserves new lines)

### 2023-05-15

- Added extension preference to include temperature/creativity parameter in model schema
- Added per-command creativity parameter
- Removed command titles from responses copied via Copy To Clipboard actions

### 2023-05-14

- Added chat history and selection to chat views
- Added export chat action
- Added delete chat action
- Added setting for primary action on command outputs
- Added Prompt Prefix and Prompt Suffix settings
- Added 'Install All Commands' action to the command store
- Adjust behavior of acceptedFileExtensions to (hopefully) resolve some issues
- Changed async output from custom model endpoints to check whether the incoming response is the full response or just a partial update

### 2023-05-13

- Added support for X-API-Key authentication in custom model endpoints
- Fixed bug where selected files containing "," in their name would yield an error
- Fixed bug where commands whose acceptedFileExtensions fields were empty would yield an error
- Fixed bug where the `{input}` placeholder in model schemas was not provided when in a chat view

### 2023-05-12

- Added setting to group commands by category
- Added setting for prompt length limit
- Added setting for export location to use when exporting all commands
- Added previousCommand, previousPrompt, and previousResponse placeholders
- Added {{youtube:URL}} and {{youtube:searchTerm}} placeholders
  - Both placeholders will return the transcript of the first matching video result
  - Transcript text is limited to the configured prompt length limit
- Fixed allocation error when analyzing images with a dimension < 100px
- Fixed bug where placeholder replacements were run multiple times
- Fixed bug where no-view commands would not pop to root view after being run
- Fixed bug where action scripts would not run if the command was executed by the AI

### 2023-05-11

- Tweaked autonomous agent features to be more reliable
- Fixed bug where commands could not be uploaded to the PromptLab store due to missing fields
- Added accepted file extensions to command option tables
- Added command categories field
- Added ability to sort commands by category

### 2023-05-10

- Upgraded to the new useAI API
- Fixed compatibility with latest version of Raycast

### 2023-04-23

- Added "Allow AI To Run Commands" checkbox in chat views
  - The AI will run other PromptLab commands to fulfil the user's request
- Removed "Allow AI To Control Computer" checkbox in chat views, at least for now
  - It was too unreliable, and the commands approach is more understandable to users

### 2023-04-21

- Added experimental "Allow AI To Control Computer" checkbox in chat views
- Added option to choose action script type, either AppleScript or Shell (ZSH), might add other options in the future
- Restructured command creation/edit form and added support for more command metadata
- Removed old-style AppleScript placeholders (using three brackets) in order to fix using AS placeholders inside other placeholders yielding an error
- Changed max prompt length behavior so that it now ignores characters that are part of a placeholder
- Fixed bug where running commands from Quicklinks would show a "Copied To Clipboard" HUD due to having a shortcut bound to `cmd+c`
- Fixed bug where multi-line command prompts would display incorrectly in the command store

### 2023-04-20

- Added syntax highlighting to action script blocks
- Updated PromptLab Chat command to use the new CommandChatView component
- Added customizable base prompt for the PromptLab Chat command (see the command's settings)
  - Also added a setting for using selected files as context by default
  - Also added a setting for using conversation history as context by default
- Added command placeholders
- Fixed bug where only the initially selected files where recognized when using "Use Selected Files As Context" in Chat response views

### 2023-04-19

- Added example output images to the store
- Added PDF document attributes to file data when metadata is enabled
- Added page count and number of characters to PDF file data
- Added metadata info for large files instead of immediately raising an error
- Added Chat response views, layed groundwork for an improved PromptLab Chat command (coming soon)
- Added Grid response views

### 2023-04-18

- Added saliency analysis option in the create command form
- Adjusted names of PromptLab's built-in commands
  - `Create PromptLab Command` --> `New PromptLab Command`
  - `Search PromptLab Commands` --> `My PromptLab Commands`
- Added `{basePrompt}` and `{prompt}` placeholders for custom model JSON schemas
  - `{basePrompt}` is the prompt before any user input (but still including placeholder substitutions)
  - `{prompt}` is the full prompt after any user input
- Adjusted behavior of `{input}` placeholder for custom model JSON schemas
  - Now, the placeholder is replaced with the input text/select file contents, instead of the entire prompt. Use `{prompt}` to get the entire prompt instead.
- Added support for asynchronous output from custom model endpoints
- Fixed bug where Quicklink commands were unable to reference the current application and thus prevented several placeholder substitutions from working
- Fixed error when trying to run `Search PromptLab Commands` command without any commands saved`
