const asyncHandler = require("express-async-handler");
const { respondsSender } = require('../middleWare/respondsHandler');
const { ResponseCode } = require('../utils/responseCode');

const getDialogue = asyncHandler(async (req, res) => {
  respondsSender(null, "Hello Dialogue Route and controller is working", ResponseCode.successful, res);
});

const createDialogueWithDoc = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      respondsSender(null, "File not found", ResponseCode.badRequest, res);
      return;
    }

    const filePath = req.file.path;
    
    // Read the contents of the DOCX file using mammoth
    const mammoth = require("mammoth");
    const { value } = await mammoth.extractRawText({ path: filePath });
    const docxContent = value.trim(); // Extracted text content

    console.log(docxContent);
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
      formattedDialogue[`Dialogue ${index + 1}`].push(`${speaker}: ${dialogueText}`);
    }
  });

  // Push the formatted dialogue object to the array
  formattedDialogues.push(formattedDialogue);
});

// Output the array of formatted dialogues
console.log(formattedDialogues);

// Clean up created array
const filteredArray = formattedDialogues.map(obj => {
  const key = Object.keys(obj)[0]; // Get the key of the object
  const arr = obj[key]; // Get the array value
  if (arr[0].startsWith("Dialogue")) {
    const trimmedArr = arr.slice(1).map(item => item.trim()); // Remove the first element and trim each item
    return { [key]: trimmedArr };
  }
  return obj; // Leave the object unchanged if it doesn't start with "Dialogue"
});



    // Return success response
    respondsSender(filteredArray, "File uploaded successfully", ResponseCode.successful, res);
  } catch (error) {
    // Handle errors
    respondsSender(error.message, null, ResponseCode.serverError, res);
  }
});


module.exports = {
  createDialogueWithDoc,
  getDialogue
};
