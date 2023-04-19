# PromptLab DevLog - A More Detailed ChangeLog

## [Various Changes] - 2023-04-18
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