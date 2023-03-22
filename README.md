# File AI

A Raycast extension for identifying, summarizing, and comparing selected files using Raycast AI.

## Commands

- Create File AI Command
    - Create a custom File AI command accessible via 'Search File AI Commands'
- Search File AI Commands
    - Search and run custom File AI commands
- Summarize Selected Files
    - Summarize the contents of selected text files, PDFs, images, audio files, and more.
- Compare Selected Files
    - Compare and contrast the contents of selected files.
- Assess Overlap
    - Assess the overlap in ideas between the contents of two or more selected files.
- Identify Purpose
    - Get a quick overview of the purpose and usage of a file.
- Summarize Spoken Audio
    - Summarize the spoken word content of audio files.

## Images
![File Summarization Example](./examples/jpg-text-summarization-1.png)
![Audio Summarization Example](./examples/mp3-audio-summarization-1.png)
![File Comparison Example](./examples/pdf-file-comparison-1.png)
![Purpose Identification Example](./examples/app-file-identification.png)
![Overlap Analysis Example](./examples/pdf-overlap-analysis-1.png)

## Custom Commands

You can create custom File AI commands, accessed via the "Search File AI Commands" command, to execute your own prompts acting on the contents of selected files. A variety of useful defaults are provided, as listed below.

### Default Custom Commands

- Assess Academic Validity
- Compose Response
- Compose Tweet
- Create Action Items
- Create Flashcards
- Create Notes
- Create Slides
- Detect Bias
- Extract Emails
- Extract Named Entities
- Extract Phone Numbers
- Extract URLs
- Extract Vocabulary
- Find Errors
- Generate Questions
- Identify Gaps
- Make Jingle
- Make Poem
- Make Song
- Meeting Agenda
- Pattern Analysis
- Suggest File AI Prompts
- Suggest Hashtags
- Suggest Title
- Suggest Tools
- Table Of Contents
- Translate To English
- Write Abstract
- Write Caption
- Write Conclusion
- Write Discussion
- Write Introduction

### Placeholders

When creating custom commands, you can use placeholders in your prompts that will be substituted with relevant information whenever you run the command. The valid placeholders are as follows:

- {{contents}} - The contents of the selected files
- {{date}} - The UTC representation of the current date and time
- {{END}} - Marks the end of a prompt -- no content, metadata, or instructions will be appended after
- {{files}} - Replaced with the list of selected file paths
- {{fileNames}} - Replaced with the list of selected file names
- {{metadata}} - Replaced with the metadata of each file as a list below the file path
- {{user}} - Replaced with the logged in user's username

## List of Useful Prompts

### Default Commands

- Assess Academic Validity: `Assess the academic validity of the following files based on their contents, the methodologies described within, and any results obtained. Use the file names as headings.`
- Compose Response: `Compose a response to the following files in the style of an email. Sign the email with the name "{{user}}"`
- Compose Tweet: `Compose a tweet based on the following files:`
- Create Action Items: `Generate a markdown list of action items from the following files, using a unique identifier for each item as bold headings. If there are any errors in the files, make actions items to fix them. In a sublist of each item, provide a description, priority, estimated level of difficulty, reasonable duration for the task, and due date based on the the duration and today's date, "{{date}}". Here are the files:`
- Create Flashcards: `Create 3 Anki flashcards based on the content of the following files. Format the response as markdown with the bold questions and plaintext answers. Separate each entry with '---'.`
- Create Notes: `Create concise notes based on the following files. Discuss the meaning and significance of topics mentioned. Discuss any other relevant details and facts about the file. Format the response as a markdown list. Each list item should be 10 words for fewer. `
- Create Slides: `Generate 3 or more slideshow slides for each of the following files based on their content. Each slide should have 3 or 4 meaningful bullet points. Organize the slides by topic. Format the slides as markdown lists with '---' separating each slide. Describe an image to include with each slide. Suggest links related to each slide's content. Provide an appropriate title for the slideshow at the beginning of the response.`
- Detect Bias: `Identify and explain the significance of any biases in the content of the following files. Discuss what the risks and dangers of those biases are, and discuss how those risks could be minimized.`
- Extract Code: `Extract lines of code written in programming languages from the following files. Format the response as markdown code blocks. Place the programming language used in each block as the heading above it. Provide a brief description of what the code does below each block. Do not provide any other commentary.`
- Extract Emails: `Extract emails from the following files and list them as markdown links:`
- Extract Named Entities: `What are the named entities in the following files, and what are their meanings and purpose? Clarify any abbreviations. Format the response as markdown list of sentences with the entity terms in bold. Use the file names as headings.`
- Extract Phone Numbers: `Identify all phone numbers in the following files and list them using markdown. Include anything that might be a phone number. If possible, provide the name of the person or company to which the phone number belongs.`
- Extract URLs: `Extract URLs from the following files and list them as markdown links`
- Extract Vocabulary: `Extract the most difficult vocabulary words from the following files and define them. Format the response as a markdown list.`
- Find Errors: `What errors and inconsistencies in the following files, why are they significant, and how can I fix them? Format the response as markdown list of sentences with the file names in bold. Use the file names as headings.`
- Generate Questions: `Generate questions based on the content of each of the following files, their metadata, filename, type, and other information. Format the response as a markdown list.`
- Identify Gaps: `Identify any gaps in understanding or content that occur in the following files. Use the file names as headings. Provide content to fill in the gaps.`
- Make Jingle: `Create short, memorable jingles summarizing the main ideas in each of the following files, using the file names as headings.`
- Make Poem: `Make rhyming poems about the the following files. Be creative and include references to the content and purpose of the file in unexpected ways. Do not summarize the file. Make each poem at least 3 stanzas long, but longer for longer files. Use the file names as markdown headings.`
- Make Song: `Make a song based on the content of the following files. Provide a name for the song.`
- Meeting Agenda: `Create a meeting agenda covering the contents of the following files. Use today's date and time, {{date}}, to provide headings and structure to the agenda.`
- Metadata Analysis: `I want you to give several insights about files based on their metadata and file type. Do not summarize the file content, but instead relate the metadata to the content in a meaningful way. Use metadata to suggest improvements to the content. Provide detailed explanations for your suggestions. Format your response as a paragraph summary. Use the file names as headings.\nHere's the metadata:{{metadata}}\n\nHere are the files:`
- Pattern Analysis: `Identify and describe any patterns or trends in the content of the following files. Use the file names as headers.`
- Suggest File AI Prompts: `Suggest prompts for an AI that can read the contents of selected files based on the contents of the following files. Use the file contents to create useful prompts that could act on the files. The AI does not have the ability to modify files or create new ones. All prompts should reference "the contents of the following files".`
- Suggest Hashtags: `Suggest hashtags for the following files based on their contents. Use the file names as markdown headings.`
- Suggest Improvements: `Suggest improvements to the content of the following files. Use the file names as headings. Format the response as a markdown list.`
- Suggest Title: `Suggest new titles for the following files based on their content and topics mentioned. Use the file names as headings.`
- Suggest Tools: `Suggest tools to use based on the topics discussed in the following files. Explain why each tool is relevant. Use the file names as headings. Do not provide any commentary other than the list of tools and their explanations.`
- Table Of Contents: `Generate a table of contents for each of the following files based on their content. Use the file names as headings. For each item in the table, provide an percent estimation of how far into the document the associated content occurs. Format the response as a markdown list.`
- Translate To English: `Translate the following files to English, using the file names as headings. Reword the translations so that they make sense in plain English. If the phrase is well known in either English or the source language, use the most commonly accepted translation.`
- Write Abstract: `Write an abstract for the following files in the style of an academic research paper. Use the file names as headings. If the abstract includes a list, briefly describe it instead of listing all elements.`
- Write Caption: `Write a two-sentence caption for these files in the style of a typical image caption, based on their contents. Use the file names as headings. The caption should summarize the content and describe its overall purpose and significance.`
- Write Conclusion: `Write conclusions for the following files in the style of the rest of their content, using the file names as headers. The conclusion should wrap up the meaning, purpose, significance, pitfalls, room to improvement, and suggest plans for future work.`
- Write Discussion: `Write a new discussion section for each of the following files in the style of an academic research paper. The discussion should be past tense and highlight the paper's successes. Use the file names as headings.`
- Write Introduction: `Write improved introduction sections for the following files in the style of an academic research paper. Use the file names as headings. The introductions must be at least 3 paragraphs long and describe what the file's contents are about, in future tense, as well as provide background information and a summary of the results. If the introduction includes a list, briefly describe the list instead of listing all elements.`

### Non-Default Commands

- Identify Relationship: `In one paragraph, identify any relationships that might exist between the following files based on their content and the topics they mention. Always identify some relationship, even if it is very general.`
- What Is This?: `Based on the content of the following files, answer this question: What is this? Use the file names as headings.`