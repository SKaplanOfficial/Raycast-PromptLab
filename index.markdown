---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

PromptLab is a Raycast extension for creating powerful, contextually-aware AI commands using placeholders, action scripts, and more.

PromptLab allows you to create custom AI commands with prompts that utilize contextual placeholders such as {% raw %}{{selectedText}}, {{todayEvents}}, or {{currentApplication}}{% endraw %} to vastly expand the capabilities of Raycast AI. PromptLab can also extract information from selected files, if you choose, so that it can tell you about the subjects in an image, summarize a PDF, and more.

PromptLab also supports "action scripts" -- AppleScripts which run with the AI's response as input. This opens a whole new world of capabilities such as allowing the AI to generate and modify files.

## Table Of Contents

- [Top-Level Commands](#top-level-commands)
- [Images](#images)
- [Create Your Own Commands](#create-your-own-commands)
    - [Placeholders](#placeholders)
        - [Script Placeholders](#script-placeholders)
        - [URL Placeholders](#url-placeholders)
        - [API Data Placeholders](#api-data-placeholders)
        - [Application Data Placeholders](#application-data-placeholders)
        - [Calendar Data Placeholders](#calendar-data-placeholders)
        - [Context Data Placeholders](#context-data-placeholders)
        - [File Data Placeholders](#file-data-placeholders)
        - [System Data Placeholders](#system-data-placeholders)
        - [Other Placeholders](#other-placeholders)
    - [Action Scripts](#action-scripts)
        - [Provided Handlers](#provided-handlers)
- [List Of Useful Prompts](#list-of-useful-prompts)
    - [Default Command Prompts](#default-command-prompts)
    - [Non-Default Command Prompts](#non-default-command-prompts)
- [Installation](#installation)
    - [Manual Installation](#manual-installation)
- [Useful Resources](#useful-resources)

## Top-Level Commands

- Create PromptLab Command
    - Create a custom PromptLab command accessible via 'Search PromptLab Commands'
- Search PromptLab Commands
    - Search and run custom PromptLab commands
- Summarize Selected Files
    - Summarize the contents of selected text files, PDFs, images, audio files, and more.
- PromptLab Chat
    - Start a back-and-forth conversation with AI with selected files provided as context.       
- Import Custom PromptLab Commands
    - Add custom commands from a JSON string.

## Images
![Preview of Search PromptLab Commands showing the default command 'Split Into Text Files'](./assets/promptlab-1.png)
![Editing a command](./assets/promptlab-2.png)
![Customization options for commands](./assets/promptlab-3.png)
![Identify Selected Files example](./assets/promptlab-4.png)
![Recent News Headlines Example](./assets/promptlab-5.png)
![PromptLab commands as Quicklinks](./assets/promptlab-6.png)