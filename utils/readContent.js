const asyncHandler = require("express-async-handler");
const { respondsSender } = require("../middleWare/respondsHandler");
const { ResponseCode } = require("../utils/responseCode");
const Dialogue = require("../models/dialogueModel");
const subDialogue = require("../models/subDialogueModel");
const dotenv = require("dotenv").config();


const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
    const mammoth = require("mammoth");

async function main() {
  try {
    // List all files in the "Test Dialogue" folder and its subfolders
    const [files] = await storage.bucket(process.env.BUCKET_NAME).getFiles({
      prefix: 'Test Dialogue/', // Filter by folder path
    });

    const dialogues = [];

    // Process each file
    for (const file of files) {
      // Extract folder and file names
      const [_, ...pathArray] = await file.name.split('/');
      const folder = await pathArray?.slice(0, -1).join('/');
      const fileName = await pathArray?.slice(-1)[0];

     

      // Read file content
      const content = await readFileContent(file);
      
      // Output content as JSON
        dialogues.push({ folder: folder || "", fileName: fileName || "", content: content || "" });
    }
  
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
    const {value} = await mammoth.extractRawText({ buffer: content });

    // Return the extracted raw text value
    return value;
  } catch (err) {
    console.error('Error reading content of file:', err);
    return null;
  }
}
const cleanUp =(content)=>{

    const unescapedContent = content.replace(/\\n/g, "\n");
    const dialogues = unescapedContent.split("\n\n\n\n").map(dialogue => {
        const lines = dialogue.split('\n');
        const dialogueObj = {
            [`Dialogue ${lines[0].replace(/\D/g, '')}`]: []
        };
        lines.slice(1).forEach(line => {
            dialogueObj[`Dialogue ${lines[0].replace(/\D/g, '')}`].push(line.trim());
        });
        return dialogueObj;
    });


 // Remove empty strings from each dialogue array
const cleanedDialogues = dialogues
    .map(dialogue => {
        const cleanedDialogue = {};
        for (const key in dialogue) {
            if (Object.hasOwnProperty.call(dialogue, key)) {
                cleanedDialogue[key] = dialogue[key].filter(line => line.trim() !== '');
            }
        }
        return cleanedDialogue;
    })
    .filter(dialogue => Object.values(dialogue)[0].length > 0); // Remove objects with empty arrays
  return cleanedDialogues;
}
//function that put things to db
const addContentDB = async (docxContent, domain, scenario) => {
    try {
        const content = docxContent.trim(); // remove all excess spaces

        // Clean up content
        const cleanedDialogues = cleanUp(content);
        // Read to db
     for (const item of cleanedDialogues) {
    const dialogueTitle = Object.keys(item)[0];
    const dialogueTexts = item[dialogueTitle];

    // Check if any subDialogue already exists for any of the dialogueTexts
    let subDialoguesExist = false;
    for (const dialogueText of dialogueTexts) {
        const words = dialogueText.split(":");
        if (words.length < 2) {
            console.error(`Invalid dialogue format: '${dialogueText}'. Skipping...`);
            continue;
        }

        const subDialogueText = words[1].trim();
        const existingSubDialogue = await subDialogue.findOne({ text: subDialogueText });
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
            domain: domain || "not specified",
            scenario: scenario || "not specified",
        });

        // Save the dialogue instance to the database
        await dialogue.save();

        // Save subDialogue instances associated with the dialogue
        for (const dialogueText of dialogueTexts) {
            const words = dialogueText.split(":");
            if (words.length < 2) {
                console.error(`Invalid dialogue format: '${dialogueText}'. Skipping...`);
                continue;
            }

            const subDialogueText = words[1].trim();
            const subDialogueItem = new subDialogue({
                text: subDialogueText,
                identifier: words[0],
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


        // Assuming respondsSender is defined elsewhere and takes the appropriate arguments
       console.log("File uploaded successfully");
    } catch (error) {
        console.error("Error saving data:", error);
        // Assuming respondsSender is defined elsewhere and takes the appropriate arguments
    }
};




// Define fetchDialogues function
const fetchDialogues = asyncHandler(async (req, res) => {
  try {
    // Call the main function and await its result
    const dialogues = await main();
   
    console.log(dialogues.length);
    // Iterate over dialogues and add them to the database
    for (let index = 0; index < dialogues.length; index++) {
      const document = dialogues[index];
      // For testing, process only one document (remove this condition later)
      if (document.content!="") {
      //get just file name as scenario
        const file = document.fileName;
        const fileparts = file.split(".");
        const scenario = fileparts[0]; 
      //get just foldername name as domain
        const folderName = document.folder;
         const folderparts = folderName.split(".");
          const domain = folderparts[1].trim();

        const docxContent = JSON.stringify(document.content)
         
        // Add content to the database
        await addContentDB(docxContent, domain, scenario);
      }
    }

    // Send response indicating success
   console.log('Dialogues added to the database successfully');
   respondsSender("Dialogues added to the database successfully", null, ResponseCode.successful, res);
  } catch (error) {
    // Handle errors
    console.error('Error fetching and storing dialogues:', error);
    respondsSender("Dialogues added to the database successfully", null, ResponseCode.successful, res);
  }
});

module.exports = {
  fetchDialogues,
};