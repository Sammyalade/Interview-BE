const asyncHandler = require("express-async-handler");
const { respondsSender } = require("../middleWare/respondsHandler");
const { ResponseCode } = require("../utils/responseCode");
const Dialogue = require("../models/dialogueModel");
const subDialogue = require("../models/subDialogueModel");
const userTask = require("../models/userTaskModel");

const getDialogue = asyncHandler(async (req, res) => {
  respondsSender(
    null,
    "Hello Dialogue Route and controller is working",
    ResponseCode.successful,
    res
  );
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
            const subDialogueItem = new subDialogue({
              text,
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
      console.log("Data saved successfully!");
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
  } catch (error) {
    // Handle errors
    respondsSender(error.message, null, ResponseCode.serverError, res);
  }
});

// Get a particular user dialogue tasks.
const getUserTasks = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming you get the user ID from the request parameters
    // return respondsSender(userId, "No tasks found for the user", ResponseCode.noData, res);

    const userTasks = await userTask.find({ userId });

    // Extract subDialogueIds and taskStages from userTasks
    const subDialogueIdsWithTaskStages = userTasks.map((task) => ({
      subDialogueId: task.subDialogueId,
      taskStage: task.taskStage, // Assuming this is how you access the taskStage field
    }));

    // Query subDialogue using the extracted subDialogueIds
    const subDialogues = await subDialogue.find({
      _id: {
        $in: subDialogueIdsWithTaskStages.map((item) => item.subDialogueId),
      },
    });

    // Combine subDialogues with their corresponding taskStages
    const subDialoguesWithTaskStages = subDialogues.map((subDialogueItem) => {
      const { _id, ...rest } = subDialogueItem.toObject(); // Extract properties excluding _id
      const taskStage = subDialogueIdsWithTaskStages.find((item) =>
        item.subDialogueId.equals(_id)
      ); // Find corresponding taskStage
      return { ...rest, taskStage: taskStage ? taskStage.taskStage : null }; // Combine subDialogueItem with taskStage
    });

    // Now subDialoguesWithTaskStages contains all subDialogue items associated with their respective taskStages

    // Respond with subDialoguesWithTaskStages
    respondsSender(
      subDialoguesWithTaskStages,
      "User tasks retrieved successfully",
      ResponseCode.successful,
      res
    );
  } catch (error) {
    // Handle errors
    console.error("Error fetching user tasks:", error);
    respondsSender(error.message, null, ResponseCode.internalServerError, res); // Pass internal server error status code
  }
});

module.exports = {
  createDialogueWithDoc,
  getDialogue,
  getUserTasks,
};
