const asyncHandler = require("express-async-handler");
const { respondsSender } = require('../middleWare/respondsHandler');
const { ResponseCode } = require('../utils/responseCode');

const Dialogue = require("../models/dialogueModel");
const subDialogue = require("../models/subDialogueModel");
const Translate = require("../models/translateModel");
const Speak = require("../models/speakModel");
const Record = require("../models/recordModel");
const UserTask = require("../models/userTaskModel");


const test = asyncHandler(async (req, res) => {
  respondsSender(
    null,
    "Hello Dialogue Route and controller is working",
    ResponseCode.successful,
    res
  );
});

const saveRecording = asyncHandler(async (req, res) => {
    // Get data sent by user (subdialogueId, taskStage, userId, dialogueId, filePath) and validate
    const { userId, subDialogueId, dialogueId, taskStage, taskId, filePath } = req.body;
    if (!userId || !subDialogueId || !dialogueId || !taskStage || !taskId || !filePath) {
        respondsSender(
            null,
            "Please ensure that userId, subdialogueId, dialogueId, taskStage, taskId, and filePath are all included in the body",
            ResponseCode.badRequest,
            res
        );
        return; // Return to prevent further execution
    }

    try {
        // Save the recording data
        const Recording = await Record.create({
            userId, subDialogueId, dialogueId, filePath
        });

        // Check if the recording was created successfully
        if (Recording) {
            // Update user task stage
            const newTaskStage = taskStage + 1;
            const userTask = await UserTask.findById(taskId);
            
            if (userTask) {
                // Update the task stage
                userTask.taskStage = newTaskStage;
                await userTask.save();
                respondsSender(null, "Recording successful", ResponseCode.successful, res);
            } else {
                respondsSender(null, "Task stage not found", ResponseCode.successful, res);
            }
        } else {
            respondsSender(null, "Error creating recording", ResponseCode.internalServerError, res);
        }
    } catch (error) {
        // An error occurred during recording creation or task update
        respondsSender(null, "Unknown error, "+error, ResponseCode.internalServerError, res);
    }
});



const saveTranslate = asyncHandler(async (req, res) => {
  // Get data sent by user (subdialogueId, taskStage, userId, dialogueId, translateText) and validate
    const { userId, subDialogueId, dialogueId, taskStage, taskId, translateText, language } = req.body;
    if (!userId || !subDialogueId || !dialogueId || !taskStage || !taskId || !translateText || !language) {
        respondsSender(
            null,
            "Please ensure that userId, subdialogueId, dialogueId, taskStage, taskId, language and translateText are all included in the body", 
            ResponseCode.badRequest,
            res
        );
        return; // Return to prevent further execution
    }

    try {
        // Save the recording data
        const Translation = await Translate.create({
            userId, subDialogueId, dialogueId, translateText, language
        });

        // Check if the recording was created successfully
        if (Translation) {
            // Update user task stage
            const newTaskStage = taskStage + 1;
            const userTask = await UserTask.findById(taskId);
            
            if (userTask) {
                // Update the task stage
                userTask.taskStage = newTaskStage;
                await userTask.save();
                respondsSender(null, "Translation successful", ResponseCode.successful, res);
            } else {
                respondsSender(null, "Task stage not found", ResponseCode.successful, res);
            }
        } else {
            respondsSender(null, "Error creating Translation", ResponseCode.internalServerError, res);
        }
    } catch (error) {
        // An error occurred during recording creation or task update
        respondsSender(null, "Unknown error, please check your code", ResponseCode.internalServerError, res);
    }

});
const saveSpeak = asyncHandler(async (req, res) => {
   // Get data sent by user (subdialogueId, taskStage, userId, dialogueId, filePath) and validate
    const { userId, subDialogueId, dialogueId, taskStage, taskId, filePath , language } = req.body;
    if (!userId || !subDialogueId || !dialogueId || !taskStage || !taskId || !filePath || !language) {
        respondsSender(
            null,
            "Please ensure that userId, subdialogueId, dialogueId, taskStage, taskId, language and filePath are all included in the body",
            ResponseCode.badRequest,
            res
        );
        return; // Return to prevent further execution
    }

    try {
        // Save the recording data
        const Speaking = await Speak.create({
            userId, subDialogueId, dialogueId, filePath, language
        });

        // Check if the recording was created successfully
        if (Speaking) {
            // Update user task stage
            const newTaskStage = taskStage + 1;
            const fetchUserTask = await UserTask.findById(taskId);
            
            if (fetchUserTask) {
                // Update the task status done
                fetchUserTask.taskStatus = "Done";
                fetchUserTask.taskStage = newTaskStage;
                await fetchUserTask.save();
                respondsSender(fetchUserTask, "Speaking successful", ResponseCode.successful, res);
            } else {
                respondsSender(null, "Task stage not found", ResponseCode.successful, res);
            }
        } else {
            respondsSender(null, "Error creating Speaking", ResponseCode.internalServerError, res);
        }
    } catch (error) {
        // An error occurred during recording creation or task update
        respondsSender(null, "Unknown error, please check your code"+error, ResponseCode.internalServerError, res);
    }
});

const skipTask = asyncHandler(async (req, res) => {
    // Get data sent by user (userId, subDialogueId, taskId) and validate
    const { userId, subDialogueId, taskId } = req.body;
    if (!userId || !subDialogueId || !taskId) {
        respondsSender(
            null,
            "Please ensure that userId, subDialogueId, and taskId are all included in the body",
            ResponseCode.badRequest,
            res
        );
        return; // Return to prevent further execution
    }

    try {
        // Update subDialogue status to skipped
        const fetchUserSubDialogue = await subDialogue.findById(subDialogueId);
        if (fetchUserSubDialogue) {
            fetchUserSubDialogue.skippedStatus = true;
            await fetchUserSubDialogue.save();
        } else {
            respondsSender(null, "SubDialogue not found", ResponseCode.badRequest, res);
        }

        // Update user task status to "Skipped"
        const fetchUserTask = await UserTask.findById(taskId);
        if (fetchUserTask) {
            fetchUserTask.taskStatus = "Skipped";
            await fetchUserTask.save();
            respondsSender(fetchUserTask, "Task skipped successfully", ResponseCode.successful, res);
        } else {
            respondsSender(null, "Task not found", ResponseCode.badRequest, res);
        }
    } catch (error) {
        // An error occurred during the process
        respondsSender(null, "Unknown error: " + error.message, ResponseCode.internalServerError, res);
    }
});


// Task Meter: number of done tasks over number of total tasks
const getMeter = asyncHandler(async(req, res) => {
  // Collect userId
  const userId = req.params.userId;
  // Fetch number of all tasks assigned to user.
  const totalTasks = await UserTask.countDocuments({ userId:userId });
  // Fetch number of all done user tasks.
  const doneTasks = await UserTask.countDocuments({ userId:userId, taskStatus: "Done" });
  const result = {
    totalTasks,
    doneTasks
  }
       respondsSender(result, "Successful", ResponseCode.successful, res);

});
module.exports = {

 saveRecording, saveTranslate, saveSpeak, skipTask, test, getMeter
}