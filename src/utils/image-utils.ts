import { runAppleScript } from "run-applescript";
import { filterString } from "./calendar-utils";
import { CommandOptions } from "./types";
import * as fs from "fs";
import exifr from "exifr";

/**
 * Obtains EXIF data for an image file.
 *
 * @param filePath The path to the image file.
 * @returns The EXIF data as a string.
 */
export const getFileExifData = async (filePath: string) => {
  /* Gets the EXIF data and metadata of an image file. */
  const exifData = await exifr.parse(filePath);
  const metadata = fs.statSync(filePath);
  return JSON.stringify({ ...exifData, ...metadata });
};

/**
 * Obtains a description of an image by using computer vision and EXIF data.
 *
 * @param filePath The path of the image file.
 * @param options A {@link CommandOptions} object describing the types of information to include in the output.
 * @returns The image description as a string.
 */
export const getImageDetails = async (
  filePath: string,
  options: CommandOptions
): Promise<{
  output: string;
  imageText: string;
  imageSaliency: string;
  imageBarcodes: string;
  imageAnimals: string;
  imageRectangles: string;
  imageSubjects: string;
  imageFaces: string;
  imageEXIFData: string;
}> => {
  const imageDetails = await getImageVisionDetails(filePath, options);
  const imageVisionInstructions = filterString(imageDetails.output);
  const exifData = options.useMetadata ? filterString(await getFileExifData(filePath)) : ``;
  const exifInstruction = options.useMetadata ? `<EXIF data: ###${exifData}###>` : ``;
  return {
    ...imageDetails,
    imageEXIFData: exifInstruction,
    output: `${imageVisionInstructions}${exifInstruction}`,
  };
};

/**
 * Obtains information about objects within an image using Apple's Vision framework.
 *
 * @param filePath The path of the image file.
 * @param options A {@link CommandOptions} object describing the types of information to obtain.
 * @returns A string containing all extracted Vision information.
 */
const getImageVisionDetails = async (
  filePath: string,
  options: CommandOptions
): Promise<{
  output: string;
  imageText: string;
  imageSaliency: string;
  imageBarcodes: string;
  imageAnimals: string;
  imageRectangles: string;
  imageSubjects: string;
  imageFaces: string;
}> => {
  const imageDetails = await runAppleScript(`use framework "Vision"
  
    set confidenceThreshold to 0.7
    
    set imagePath to "${filePath}"
    set promptText to ""
  
    try
    set theImage to current application's NSImage's alloc()'s initWithContentsOfFile:imagePath
    
    set requestHandler to current application's VNImageRequestHandler's alloc()'s initWithData:(theImage's TIFFRepresentation()) options:(current application's NSDictionary's alloc()'s init())
    
    set textRequest to current application's VNRecognizeTextRequest's alloc()'s init()
    set classificationRequest to current application's VNClassifyImageRequest's alloc()'s init()
    set barcodeRequest to current application's VNDetectBarcodesRequest's alloc()'s init()
    set animalRequest to current application's VNRecognizeAnimalsRequest's alloc()'s init()
    set faceRequest to current application's VNDetectFaceRectanglesRequest's alloc()'s init()
    set rectRequest to current application's VNDetectRectanglesRequest's alloc()'s init()
    set saliencyRequest to current application's VNGenerateAttentionBasedSaliencyImageRequest's alloc()'s init()
    rectRequest's setMaximumObservations:0
    
    if theImage's |size|()'s width > 200 and theImage's |size|()'s height > 200 then
      requestHandler's performRequests:{textRequest, classificationRequest, barcodeRequest, animalRequest, faceRequest, rectRequest, saliencyRequest} |error|:(missing value)
    else
      requestHandler's performRequests:{textRequest, classificationRequest, barcodeRequest, animalRequest, faceRequest, saliencyRequest} |error|:(missing value)
    end if
  
    -- Extract raw text results
    set textResults to textRequest's results()
    set theText to ""
    repeat with observation in textResults
      set theText to theText & ((first item in (observation's topCandidates:1))'s |string|() as text) & ", "
    end repeat
    
    ${
      options.useSubjectClassification
        ? `-- Extract subject classifications
    set classificationResults to classificationRequest's results()
    set classifications to {}
    repeat with observation in classificationResults
      if observation's confidence() > confidenceThreshold then
        copy observation's identifier() as text to end of classifications
      end if
    end repeat
  
    -- Extract animal detection results
    set animalResults to animalRequest's results()
    set theAnimals to ""
    repeat with observation in animalResults
      repeat with label in (observation's labels())
        set theAnimals to (theAnimals & label's identifier as text) & ", "
      end repeat
    end repeat
    
    if theAnimals is not "" then
      set theAnimals to text 1 thru -3 of theAnimals
    end if`
        : ``
    }
    
    ${
      options.useBarcodeDetection
        ? `-- Extract barcode text results
    set barcodeResults to barcodeRequest's results()
    set barcodeText to ""
    repeat with observation in barcodeResults
      set barcodeText to barcodeText & (observation's payloadStringValue() as text) & ", "
    end repeat
    
    if length of barcodeText > 0 then
      set barcodeText to text 1 thru ((length of barcodeText) - 2) of barcodeText
    end if`
        : ``
    }
    
    ${
      options.useFaceDetection
        ? `-- Extract number of faces detected
    set faceResults to faceRequest's results()
    set numFaces to count of faceResults`
        : ``
    }
    
    ${
      options.useRectangleDetection
        ? `-- Extract rectangle coordinates
    if theImage's |size|()'s width > 200 and theImage's |size|()'s height > 200 then
      set rectResults to rectRequest's results()
      set imgWidth to theImage's |size|()'s width
      set imgHeight to theImage's |size|()'s height
      set rectResult to {}
      repeat with observation in rectResults
        set bottomLeft to (("Coordinate 1:(" & observation's bottomLeft()'s x as text) & "," & observation's bottomLeft()'s y as text) & ") "
        set bottomRight to (("Coordinate 2:(" & observation's bottomRight()'s x as text) & "," & observation's bottomRight()'s y as text) & ") "
        set topRight to (("Coordinate 3:(" & observation's topRight()'s x as text) & "," & observation's topRight()'s y as text) & ") "
        set topLeft to (("Coordinate 4:(" & observation's topLeft()'s x as text) & "," & observation's topLeft()'s y as text) & ") "
        copy bottomLeft & bottomRight & topRight & topLeft to end of rectResult
      end repeat
    end if`
        : ``
    }
  
    ${
      options.useSaliencyAnalysis
        ? `-- Identify areas most likely to draw attention
    set pointsOfInterest to ""
    set saliencyResults to saliencyRequest's results()
    repeat with observation in saliencyResults
      set salientObjects to observation's salientObjects()
      repeat with salientObject in salientObjects
        set bl to salientObject's bottomLeft()
        set br to salientObject's bottomRight()
        set tl to salientObject's topLeft()
        set tr to salientObject's topRight()
  
        set midX to (bl's x + br's x) / 2
        set midY to (bl's y + tl's y) / 2
        set pointsOfInterest to pointsOfInterest & (" (" & midX as text) & "," & midY as text & ")"
      end repeat
    end repeat`
        : ``
    }
    
    if theText is not "" then
      set promptText to "<Transcribed text of the image: \\"" & theText & "\\".>"
    end if
  
    ${
      options.useSaliencyAnalysis
        ? `if pointsOfInterest is not "" then
      set promptText to promptText & "<Areas most likely to draw attention: " & pointsOfInterest & ">"
    end if`
        : ``
    }
    
    ${
      options.useSubjectClassification
        ? `if length of classifications > 0 then
      set promptText to promptText & "<Possible subject labels: " & classifications & ">"
    end if
    
    if theAnimals is not "" then
      set promptText to promptText & "<Animals represented: " & theAnimals & ">"
    end if`
        : ``
    }
  
    ${
      options.useBarcodeDetection
        ? `if barcodeText is not "" then
      set promptText to promptText & "<Barcode or QR code payloads: " & barcodeText & ">"
    end if`
        : ``
    }
    
    ${
      options.useRectangleDetection
        ? `if theImage's |size|()'s width > 200 and theImage's |size|()'s height > 200 then
        if (count of rectResult) > 0 then
          set promptText to promptText & "<Boundaries of rectangles: ###"
          set theIndex to 1
          repeat with rectCoords in rectResult
            set promptText to promptText & "	Rectangle #" & theIndex & ": " & rectCoords & "
        "
            set theIndex to theIndex + 1
          end repeat
          set promptText to promptText & "###>"
        end if
      end if`
        : ``
    }
    
    ${
      options.useFaceDetection
        ? `if numFaces > 0 then
      set promptText to promptText & "<Number of faces: " & numFaces & ">"
    end if`
        : ``
    }
    end try
  
    return promptText`);

  return {
    output: imageDetails,
    imageText: imageDetails.match(/<Transcribed text of the image: "(.*?)".>/)?.[1] || "",
    imageSaliency: imageDetails.match(/<Areas most likely to draw attention: (.*?)>/)?.[1] || "",
    imageSubjects: imageDetails.match(/<Possible subject labels: (.*?)>/)?.[1] || "",
    imageAnimals: imageDetails.match(/<Animals represented: (.*?)>/)?.[1] || "",
    imageBarcodes: imageDetails.match(/<Barcode or QR code payloads: (.*?)>/)?.[1] || "",
    imageRectangles: imageDetails.match(/<Boundaries of rectangles: ###([\s\S]*?)###>/)?.[1] || "",
    imageFaces: imageDetails.match(/<Number of faces: (.*?)>/)?.[1] || "",
  };
};

/**
 * Extracts text from a PDF.
 *
 * @param filePath The path of the PDF file.
 * @param useOCR Whether to use OCR to extract additional text from the PDF
 * @param pageLimit The number of pages to use OCR on if asImages is true.
 * @returns The text of the PDF as a string.
 */
export const getPDFText = async (
  filePath: string,
  useOCR: boolean,
  pageLimit: number,
  options: CommandOptions,
): Promise<{
  pdfOCRText: string;
  pdfRawText: string;
  imageText: string;
}> => {
  const script = await runAppleScript(`use framework "PDFKit"
    use framework "Quartz"
    use framework "Vision"
    
    set theURL to current application's |NSURL|'s fileURLWithPath:"${filePath}"
    set thePDF to current application's PDFDocument's alloc()'s initWithURL:theURL
    set pdfData to current application's NSMutableDictionary's alloc()'s init()
    set pdfText to ""

    set ocrText to ""
    ${useOCR ? `set numPages to thePDF's pageCount()
    if ${pageLimit} < numPages then
    set numPages to ${pageLimit}
    end if
    repeat with i from 0 to numPages - 1
    set thePage to (thePDF's pageAtIndex:i)
    set theBounds to (thePage's boundsForBox:(current application's kPDFDisplayBoxMediaBox))
    set pageImage to (current application's NSImage's alloc()'s initWithSize:(item 2 of theBounds))
    pageImage's lockFocus()
    (thePage's drawWithBox:(current application's kPDFDisplayBoxMediaBox))
    pageImage's unlockFocus()
    
    set requestHandler to (current application's VNImageRequestHandler's alloc()'s initWithData:(pageImage's TIFFRepresentation()) options:(current application's NSDictionary's alloc()'s init()))
    set textRequest to current application's VNRecognizeTextRequest's alloc()'s init()
    (requestHandler's performRequests:{textRequest} |error|:(missing value))
    
    set textResults to textRequest's results()
    
    repeat with observation in textResults
        set ocrText to ocrText & ((first item in (observation's topCandidates:1))'s |string|() as text) & ", "
    end repeat
    end repeat
    set pdfText to ocrText` : ``}
    pdfData's setValue:ocrText forKey:"pdfOCRText"

    set rawText to thePDF's |string|() as text
    set pdfText to pdfText & rawText
    pdfData's setValue:rawText forKey:"pdfRawText"

    ${options.useMetadata ? `set pdfText to pdfText & "\n\n" & (thePDF's documentAttributes() as record as text)` : ``}
    pdfData's setValue:pdfText forKey:"imageText"

    set pageCount to thePDF's pageCount()
    pdfData's setValue:pageCount forKey:"pageCount"
    

    set jsonObj to current application's NSJSONSerialization's dataWithJSONObject:pdfData options:(current application's NSJSONWritingFragmentsAllowed) |error|:(missing value)
    return (current application's NSString's alloc()'s initWithData:jsonObj encoding:(current application's NSUTF8StringEncoding)) as text`);
  return JSON.parse(script);
};