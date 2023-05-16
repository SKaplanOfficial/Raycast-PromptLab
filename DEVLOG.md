# PromptLab DevLog - A More Detailed ChangeLog

## 2023-05-15

- Added extension preference to include temperature/creativity parameter in model schema
- Added per-command creativity parameter
- Removed command titles from responses copied via Copy To Clipboard actions

## 2023-05-14

- Added setting for primary action on command outputs
- Added Prompt Prefix and Prompt Suffix settings
- Added 'Install All Commands' action to the command store
- Adjust behavior of acceptedFileExtensions to (hopefully) resolve some issues
- Changed async output from custom model endpoints to check whether the incoming response is the full response or just a partial update

## 2023-05-13

- Fixed bug where selected files containing "," in their name would yield an error
- Fixed bug where commands whose acceptedFileExtensions fields were empty would yield an error
- Fixed bug where the `{input}` placeholder in model schemas was not provided when in a chat view

## 2023-05-12

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

## 2023-05-11

- Tweaked autonomous agent features to be more reliable
- Fixed bug where commands could not be uploaded to the PromptLab store due to missing fields
- Added accepted file extensions to command option tables
- Added command categories field
- Added ability to sort commands by category

# 2023-05-10

- Upgraded to the new useAI API
- Fixed compatibility with latest version of Raycast

## 2023-04-23

- Added "Allow AI To Run Commands" checkbox in chat views
    - The AI will run other PromptLab commands to fulfil the user's request
- Removed "Allow AI To Control Computer" checkbox in chat views, at least for now
    - It was too unreliable, and the commands approach is more understandable to users

## 2023-04-21

- Added experimental "Allow AI To Control Computer" checkbox in chat views
- Added option to choose action script type, either AppleScript or Shell (ZSH), might add other options in the future
- Restructured command creation/edit form and added support for more command metadata
- Removed old-style AppleScript placeholders (using three brackets) in order to fix using AS placeholders inside other placeholders yielding an error
- Changed max prompt length behavior so that it now ignores characters that are part of a placeholder
- Fixed bug where running commands from Quicklinks would show a "Copied To Clipboard" HUD due to having a shortcut bound to `cmd+c`
- Fixed bug where multi-line command prompts would display incorrectly in the command store

## 2023-04-20

- Added syntax highlighting to action script blocks
- Updated PromptLab Chat command to use the new CommandChatView component
- Added customizable base prompt for the PromptLab Chat command (see the command's settings)
    - Also added a setting for using selected files as context by default
    - Also added a setting for using conversation history as context by default
- Added command placeholders
- Fixed bug where only the initially selected files where recognized when using "Use Selected Files As Context" in Chat response views

## 2023-04-19

- Added example output images to the store
- Added PDF document attributes to file data when metadata is enabled
- Added page count and number of characters to PDF file data
- Added metadata info for large files instead of immediately raising an error
- Added Chat response views, layed groundwork for an improved PromptLab Chat command (coming soon)
- Added Grid response views

## 2023-04-18

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