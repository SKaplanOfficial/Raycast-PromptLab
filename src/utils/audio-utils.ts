import { runAppleScript } from "run-applescript";
import { filterString } from "./calendar-utils";

/**
 * Gets the metadata and sound classifications of an audio file.
 *
 * @param filePath The path of the audio file.
 * @param useMetadata Whether to include metadata in the output.
 *
 * @returns The metadata and sound classifications as a single string.
 */
export const getAudioDetails = async (
  filePath: string
): Promise<{
  contents: string;
  soundClassifications: string;
}> => {
  const soundClassifications = filterString((await getSoundClassification(filePath)).replace("_", " ")).trim();
  const classificationInstructions = `<Sound classifications: "${soundClassifications}".>`;
  return {
    contents: `${soundClassifications ? `\n${classificationInstructions}` : ""}`,
    soundClassifications: soundClassifications,
  };
};

/**
 * Obtains labels for sounds in an audio file.
 *
 * @param filePath The path of the audio file.
 * @returns The list of labels as a comma-separated string.
 */
export const getSoundClassification = async (filePath: string): Promise<string> => {
  return await runAppleScript(`use framework "SoundAnalysis"
  
      set confidenceThreshold to 0.6 -- Level of confidence necessary for classification to appear in result
      set theResult to "" -- Sequence of sound classification labels throughout the sound file's duration
      
      -- Analyze sound file for classifiable sounds
      on analyzeSound(filePath)
          global theResult
          
          -- Initialize sound analyzer with file
          set theURL to current application's NSURL's fileURLWithPath:filePath
          set theAnalyzer to current application's SNAudioFileAnalyzer's alloc()'s initWithURL:theURL |error|:(missing value)
          
          -- Initial sound classification request and add it to the analyzer
          set theRequest to current application's SNClassifySoundRequest's alloc()'s initWithClassifierIdentifier:(current application's SNClassifierIdentifierVersion1) |error|:(missing value)
          theAnalyzer's addRequest:(theRequest) withObserver:(me) |error|:(missing value)
          
          -- Start the analysis and wait for it to complete
          theAnalyzer's analyze()
          repeat while theResult is ""
              delay 0.1
          end repeat
          return theResult
      end analyzeSound
      
      -- Act on classification result
      on request:request didProduceResult:|result|
          global confidenceThreshold
          global theResult
          
          -- Add classification labels whose confidence meets the threshold
          set theClassifications to |result|'s classifications()
          set i to 1
          repeat while length of theResult < 1000 and i < (count of theClassifications)
              set classification to item i of theClassifications
              if classification's confidence() > confidenceThreshold then
                  set theResult to theResult & (classification's identifier() as text) & " "
              end if
              set i to i + 1
          end repeat
      end request:didProduceResult:
      
      -- Set the result if an error occurs to avoid infinite loop
      on request:request didFailWithError:|error|
          global theResult
          if theResult is "" then
              set theResult to " "
          end if
      end request:didFailWithError:
      
      -- Set the result if request completes without classifications being made to avoid infinite loop
      on requestDidComplete:request
          global theResult
          if theResult is "" then
              set theResult to " "
          end if
      end requestDidComplete:
      
      return analyzeSound("${filePath}")`);
};

/**
 * Transcribes spoken content in an audio file.
 *
 * @param filePath The path of the audio file.
 * @returns A promise to the transcribed text as a string.
 */
export const getAudioTranscription = async (filePath: string, maxCharacters: number): Promise<string> => {
  return await runAppleScript(`use framework "Speech"
      use scripting additions
      
      set maxCharacters to ${maxCharacters}
      set tempResult to ""
      set theResult to "" -- Sequence of sound classification labels throughout the sound file's duration
      
      -- Analyze sound file for classifiable sounds
      on analyzeSpeech(filePath)
          global theResult
          
          -- Initialize sound analyzer with file
          set theURL to current application's NSURL's fileURLWithPath:filePath
          set theRecognizer to current application's SFSpeechRecognizer's alloc()'s init()
          
          -- Initial speech recognition request and add it to the recognizer
          set theRequest to current application's SFSpeechURLRecognitionRequest's alloc()'s initWithURL:theURL
          theRecognizer's recognitionTaskWithRequest:(theRequest) delegate:(me)
          
          repeat while theResult is ""
              delay 0.1
          end repeat
          return theResult
      end analyzeSpeech
      
      -- Act on classification result
      on speechRecognitionTask:task didHypothesizeTranscription:transcription
          global maxCharacters
          global tempResult
          global theResult
          
          set tempResult to transcription's formattedString() as text
          
          if length of tempResult > maxCharacters then
              set theResult to tempResult
              task's cancel()
          end if
      end speechRecognitionTask:didHypothesizeTranscription:
      
      -- Set the result if an error occurs to avoid infinite loop
      on speechRecognitionTask:task didFinishRecognition:|result|
          global theResult
          
          if theResult is "" then
              set theResult to |result|'s bestTranscription()'s formattedString() as text
          end if
      end speechRecognitionTask:didFinishRecognition:
  
      on speechRecognitionTask:task didFinishSuccessfully:success
        global theResult
        if theResult is "" then
          set theResult to " "
        end if
      end speechRecognitionTask:didFinishSuccessfully:
      
      return analyzeSpeech("${filePath}")`);
};
