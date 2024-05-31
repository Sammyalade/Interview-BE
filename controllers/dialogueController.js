const asyncHandler = require("express-async-handler");
const { respondsSender } = require("../middleWare/respondsHandler");
const { ResponseCode } = require("../utils/responseCode");
const Dialogue = require("../models/dialogueModel");
const subDialogue = require("../models/subDialogueModel");
const UserTask = require("../models/userTaskModel");
const DAstatus = require("../models/dAssignmentStatus");
const Oratory = require("../models/oratoryModel");
const taskAssigner = require("../utils/taskAssigner");
const {
  UNREAD,
  ORATORY,
  DIALOGUE,
  NUM_TO_ASSIGN,
  DONE,
  SKIPPED,
} = require("../utils/constant");

const numToAssign = NUM_TO_ASSIGN;
const getDialogue = asyncHandler(async (req, res) => {
  respondsSender(
    null,
    "Hello Dialogue Route and controller is working",
    ResponseCode.successful,
    res
  );
});

// Move file to DB.
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
              text: wordsArray[1].trim(),
              identifier: wordsArray[0],
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
  } catch (error) {
    // Handle errors
    respondsSender(error.message, null, ResponseCode.serverError, res);
  }
});

// Get all tasks of a user.
const getUserTasks = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming you get the user ID from the request parameters
    // return respondsSender(userId, "No tasks found for the user", ResponseCode.noData, res);

    const userTasks = await UserTask.find({ userId });
    // Extract subDialogueIds and taskStages from userTasks

    // Create an array containing tasks with their corresponding task stages and types
    const userTaskWithTaskStages = userTasks.map((task) => ({
      subDialogueId: task.type === ORATORY ? null : task.subDialogueId,
      oratoryId: task.type === ORATORY ? task.oratoryId : null,
      taskStage: task.taskStage,
      taskType: task.type,
    }));

    // Fetch tasks from Oratory or subDialog based on their type
    const fetchTasks = await Promise.all(
      userTaskWithTaskStages.map(async (item) => {
        if (item.taskType === ORATORY) {
          const oratoryTask = await Oratory.findById(item.oratoryId);
          return oratoryTask ? oratoryTask.toObject() : null;
          // } else if (item.taskType === "dialogue") {
        } else if (item.taskType === DIALOGUE) {
          const subDialogTask = await subDialogue.findById(item.subDialogueId);
          return subDialogTask ? subDialogTask.toObject() : null;
        }
      })
    );

    // Combine fetched tasks with their corresponding task stages
    const tasksWithTaskStages = fetchTasks.map((task, index) => ({
      ...task,

      subDialogueId: userTaskWithTaskStages[index].subDialogueId,
      oratoryId: userTaskWithTaskStages[index].oratoryId,
      taskStage: userTaskWithTaskStages[index].taskStage,
      taskType: userTaskWithTaskStages[index].taskType,
    }));

    // console.log(tasksWithTaskStages); // Verify the content

    // console.log(oratoryTasks);
    // // Combine subDialogues with their corresponding taskStages
    // const fetchOratory = oratoryTasks.map((oratoryItem) => {
    //   const { _id, ...rest } = oratoryItem.toObject(); // Extract properties excluding _id
    //   const taskStage = userTaskWithTaskStages.find((item) =>
    //     item.oratoryId && item.oratoryId.equals(_id)
    //   ); // Find corresponding taskStage if subDialogueId exists
    //   return { ...rest, taskStage: taskStage ? taskStage.taskStage : null }; // Combine subDialogueItem with taskStage
    // });

    // Now subDialoguesWithTaskStages contains all subDialogue items associated with their respective taskStages

    // Respond with subDialoguesWithTaskStages
    respondsSender(
      tasksWithTaskStages,
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

// Get all undone tasks of a user.
const getUndoneTasks = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming you get the user ID from the request parameters

    // Query userTasks to find undone tasks for the user
    const userTasks = await UserTask.find({ userId, taskStatus: "Undone" }); // Assuming taskStatus field indicates the status of the task

    // If there are no undone tasks found for the user, return an appropriate response
    if (userTasks.length === 0) {
      return respondsSender(
        null,
        "No undone tasks found for the user",
        ResponseCode.noData,
        res
      );
    }

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
      "Undone tasks retrieved successfully",
      ResponseCode.successful,
      res
    );
  } catch (error) {
    // Handle errors
    console.error("Error fetching user tasks:", error);

    respondsSender(error.message, null, ResponseCode.internalServerError, res); // Pass internal server error status code
  }
});

// Get all done tasks of a user.
const getDoneTasks = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming you get the user ID from the request parameters

    // Query userTasks to find done tasks for the user
    const userTasks = await UserTask.find({ userId, taskStatus: "done" }); // Assuming taskStatus field indicates the status of the task

    // If there are no done tasks found for the user, return an appropriate response
    if (userTasks.length === 0) {
      return respondsSender(
        null,
        "No done-tasks found for the user",
        ResponseCode.noData,
        res
      );
    }

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
      "Done tasks retrieved successfully",
      ResponseCode.successful,
      res
    );
  } catch (error) {
    // Handle errors
    console.error("Error fetching user tasks:", error);
    respondsSender(error.message, null, ResponseCode.internalServerError, res); // Pass internal server error status code
  }
});

// Get a single task of a user.
const getSingleTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming you get the user ID from the request parameters

    // Query userTasks to find undone tasks for the user, sorted by creation date in descending order
    const result = await UserTask.findOne({
      userId,
      taskStatus: { $nin: [DONE, SKIPPED] },
    })
      .sort({ createdAt: 1 })
      .limit(1);

    // If there are no undone tasks found for the user, return an appropriate response
    if (!result) {
      // Check if user has ever been assigned tasks or not
      const everAssigned = await DAstatus.findOne({ userId, status: true });
      if (!everAssigned) {
        taskAssigner(numToAssign, userId);
        return respondsSender(
          null,
          "No tasks has been assigned to user.",
          ResponseCode.requestUnavailable,
          res
        );
      }

      //assign new Task of either oratory or sub dialog base on previous assignment
      taskAssigner(numToAssign, userId);

      const currentDateTime = new Date();
      const formattedDateTime = currentDateTime.toLocaleString();
      const responseMessage = `Congratulations Task completed at ${formattedDateTime}!\nKindly Logout and Login to get assigned new Task`;
      return respondsSender(
        null,
        responseMessage,
        ResponseCode.requestUnavailable,
        res
      );
    }

    // Extract the subDialogueId from the last undone task
    const resultId = result.subDialogueId || result.oratoryId;

    let taskResult, subDialogueId, oratoryId;

    // if (result.type === "Dialogue" || result.type === "dialogue") {
    if (result.type === DIALOGUE) {
      // Query subDialogue using the extracted subDialogueId
      taskResult = await subDialogue.findOne({ _id: resultId });
      if (taskResult) {
        subDialogueId = taskResult._id;
        oratoryId = null;
      } else {
        console.log("No task result found for dialogue type.");
      }
      // } else if (result.type === "Oratory" || result.type === "oratory") {
    } else if (result.type === ORATORY) {
      // Query Oratory using the extracted oratoryId
      taskResult = await Oratory.findOne({ _id: resultId });
      if (taskResult) {
        oratoryId = taskResult._id;
        subDialogueId = null;
        // console.log(`Task result: ${taskResult}`);
      } else {
        console.log("No task result found for oratory type.");
      }
    } else {
      console.log("Unsupported task type.");
    }

    // If no subDialogue found with the given ID, return an appropriate response
    if (!taskResult) {
      return respondsSender(
        null,
        "No task found with the given ID",
        ResponseCode.noData,
        res
      );
    }

    // Prepare the response data
    const responseData = {
      text: taskResult.text,
      subDialogueId,
      oratoryId,
      taskId: result._id,
      taskStage: result.taskStage,
      taskType: result.type,
      dialogueId: taskResult.dialogueId || null,
    };

    // Respond with the prepared data
    respondsSender(
      responseData,
      "Task Retrieved successfully",
      ResponseCode.successful,
      res
    );
  } catch (error) {
    // Handle errors
    console.error("Error fetching user tasks:", error);
    respondsSender(error.message, null, ResponseCode.internalServerError, res); // Pass internal server error status code
  }
});

// Get all skipped tasks of a user.
const getSkippedTasks = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming you get the user ID from the request parameters

    // Query userTasks to find skipped tasks for the user
    const userTasks = await UserTask.find({ userId, taskStatus: "Skipped" }); // Assuming taskStatus field indicates the status of the task

    // If there are no skipped tasks found for the user, return an appropriate response
    if (userTasks.length === 0) {
      return respondsSender(
        null,
        "No Skipped tasks found for the user",
        ResponseCode.noData,
        res
      );
    }

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
      "Skipped tasks retrieved successfully",
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
  getSingleTask,
  getUndoneTasks,
  getDoneTasks,
  getSkippedTasks,
};
