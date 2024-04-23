const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
    const mammoth = require("mammoth");

async function main() {
  try {
    // List all files in the "Test Dialogue" folder and its subfolders
    const [files] = await storage.bucket('front-end-audio-storage-awarri').getFiles({
      prefix: 'Test Dialogue/', // Filter by folder path
    });

    const dialogues = [];

    // Process each file
    for (const file of files) {
      // Extract folder and file names
      const [_, ...pathArray] = await file.name.split('/');
      const folder = await pathArray?.slice(0, -1).join('/');
      const fileName = await pathArray?.slice(-1)[0];

      // Display folder and file names
      // console.log('Folder:', folder);
      // console.log('File:', fileName);

      // Read file content
      const content = await readFileContent(file);
      
      // Output content as JSON
        dialogues.push({ folder: folder || "", fileName: fileName || "", content: content || "" });
    }
  // console.log(JSON.stringify(dialogues));
    return dialogues; // Return the array of dialogues
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
}

async function readFileContent(file) {
  try {
    // Download file content
    const [content] = await file.download();

    // Extract raw text from the file content
    const rawTextResult = await mammoth.extractRawText({ buffer: content });

    // Return the extracted raw text value
    return rawTextResult.value;
  } catch (err) {
    console.error('Error reading content of file:', err);
    return null;
  }
}
//function that put things to db
const addContentDB = (docxContent)=>{

 //create algorithm to convert extracted doc into object    
    // Split the text into individual dialogues
    const dialogues = docxContent.split("\n\n\n\n");

    // Initialize an empty array to store the formatted dialogues
    const formattedDialogues = [];

    // Iterate over each dialogue and format it into an object
    dialogues.forEach((dialogue, index) => {
      const lines = dialogue.split("\n\n"); // Split the dialogue into individual lines
      const formattedDialogue = {};

      // Iterate over each line in the dialogue
      lines.forEach((line, lineIndex) => {
        const speakerIndex = line.indexOf(":"); // Find the index of the colon indicating the speaker
        const speaker = line.slice(0, speakerIndex); // Extract the speaker's name
        const dialogueText = line.slice(speakerIndex + 1).trim(); // Extract the dialogue text

        // Add the speaker's line to the formatted dialogue object
        if (lineIndex === 0) {
          // If it's the first line, initialize a new array for the speaker's lines
          formattedDialogue[`Dialogue ${index + 1}`] = [dialogueText];
        } else {
          // If it's not the first line, push the speaker's line to the array
          formattedDialogue[`Dialogue ${index + 1}`].push(
            `${speaker}: ${dialogueText}`
          );
        }
      });

      // Push the formatted dialogue object to the array
      formattedDialogues.push(formattedDialogue);
    });


    // Clean up created array
    const filteredArray = formattedDialogues.map((obj) => {
      const key = Object.keys(obj)[0]; // Get the key of the object
      const arr = obj[key]; // Get the array value
      if (arr.length > 1) {
        // Check if there are more than one element in the array
        const trimmedArr = arr
          .slice(1)
          .map((item) => item.trim())
          .filter((item) => item !== ""); // Remove the first element, trim each item, and filter out empty strings
        if (trimmedArr.length <= 2) {
          // Check if the resulting array has at most two elements
          return { [key]: trimmedArr };
        } else {
          // Handle the case where there are more than two inner items (e.g., log a warning or discard the dialogue)
          respondsSender(null, "bad File", ResponseCode.successful, res);
        }
      }
      return obj; // Leave the object unchanged if it doesn't meet the conditions
    });

    // Return success response
    //respondsSender(filteredArray, "File uploaded successfully", ResponseCode.successful, res);

    // Save the data to the database
    try {
      for (const item of filteredArray) {
        const dialogueTitle = Object.keys(item)[0];
        const dialogueTexts = item[dialogueTitle];

        // Check if any subDialogue already exists for any of the dialogueTexts
        let subDialoguesExist = false;
        for (const text of dialogueTexts) {
          const existingSubDialogue = await subDialogue.findOne({ text });
          if (existingSubDialogue) {
            subDialoguesExist = true;
            break; // No need to check further if a subDialogue already exists
          }
        }

        // If no subDialogue exists, save the dialogue and associated subDialogues
        if (!subDialoguesExist) {
          // Create a new dialogue instance
          
          const dialogue = new Dialogue({
            title: dialogueTitle,
            domain: "not specified", // You may customize this according to your needs
            scenerio: "not specified", // You may customize this according to your needs
          });

          // Save the dialogue instance to the database
           await dialogue.save();
 
          // Save subDialogue instances associated with the dialogue
          for (const text of dialogueTexts) {

          const sentence = text;
          const delimiter = ":"; // space character

          const wordsArray = sentence.split(delimiter);

            const subDialogueItem = new subDialogue({
              text:wordsArray[1].trim(),
              identifier:wordsArray[0],
              dialogueId: dialogue._id, // Reference to the dialogue
              assignmentStatus: false,
              skippedStatus: false,
            });
             await subDialogueItem.save();
          }
        } else {
          console.log(
            `Skipping saving dialogue '${dialogueTitle}' as subDialogues already exist.`
          );
        }
      }
      respondsSender(
        filteredArray,
        "File uploaded successfully",
        ResponseCode.successful,
        res
      );
    } catch (error) {
      console.error("Error saving data:", error);
      respondsSender(
        error.message,
        null,
        ResponseCode.internalServerError,
        res
      );
    }
  }


// Call the main function and await its result
async function fetchDialogues() {
  const dialogues = await main();
  console.log(dialogues.length);
  //while using a for loop, put all generated content in db
  dialogues.map((document, index)=>{
    //do just 1 remove this later
    if(index==1){ 
    const fileName= document.fileName;
    const folderName= document.folder;
    const docxContent=JSON.stringify(document.content).trim()
    //put content to db appropiately
    console.log(`Document ${index} ${docxContent}`)
    await addContentDB(docxContent)
    // const readFile= 
    }
});
}

 fetchDialogues();
