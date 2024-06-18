const User = require("../models/userModel");
const DAstatus = require("../models/dAssignmentStatus");
const subDialogue = require("../models/subDialogueModel");
const Oratory = require("../models/oratoryModel");
const userTask = require("../models/userTaskModel");
const { respondsSender } = require("../middleWare/respondsHandler");
const { ResponseCode } = require("../utils/responseCode");
const { DIALOGUE, ORATORY, UNDONE } = require("./constant");

const taskAssigner = async (numToAssign, userId) => {
  const dialogueAssigner = async (numToAssign, userId) => {
    try {
      // Retrieve all subDialogues from the database where assignmentStatus is false
      const allSubDialogues = await subDialogue
        .find({ assignmentStatus: false })
        .limit(numToAssign * 2);

      //check number of retrieved subDialogu
      const numOfAllSubDialog = allSubDialogues.length;
      // Initialize an array to store the selected subDialogues
      const selectedSubDialogues = [];

      //share dialogue evenly if all dialogus is more than what is to be share else dont evenly share
      if (numOfAllSubDialog > numToAssign) {
        for (let i = 1; i <= allSubDialogues.length; i += 2) {
          selectedSubDialogues.push(allSubDialogues[i]);
        }
      } else {
        for (let i = 1; i <= allSubDialogues.length; i++) {
          selectedSubDialogues.push(allSubDialogues[i]);
        }
      }

      // Initialize a variable to keep track of the alternating assignment status
      let assign = true;

      // Iterate over the selected subDialogues
      for (let i = 0; i < selectedSubDialogues.length; i++) {
        const subDialogueItem = selectedSubDialogues[i];

        // Create a new user task
        const newUserTask = new userTask({
          taskStatus: "Undone",
          subDialogueId: subDialogueItem._id,
          userId: userId, // Replace with the actual user ID
          // type: "dialogue",
          type: DIALOGUE,
        });

        // Assign task or skip based on the alternating assign status
        if (assign) {
          await newUserTask.save();
          // Update the assignmentStatus of the subDialogueItem
          await subDialogue.findByIdAndUpdate(subDialogueItem._id, {
            assignmentStatus: true,
          });
        }
      }

      //check if user id exits in dialogue task table and assigned a task, if not insert or update user task status true
      const existingTask = await DAstatus.findOne({ userId: userId });
      if (existingTask) {
        // If the user already has a task assigned, update its status to true
        existingTask.status = true;
        existingTask.taskType = DIALOGUE;
        await existingTask.save();
      } else {
        // If the user does not have a task assigned, insert a new document
        const newTask = new DAstatus({
          userId: userId,
          status: true,
          taskType: DIALOGUE,
        });
        await newTask.save();
      }

      // respondsSender(selectedSubDialogues, "User tasks created successfully!", ResponseCode.successful, res);
    } catch (error) {
      // respondsSender(error, "Error creating user tasks", ResponseCode.internalServerError, res);
    }
  };

  //Function that assigns oratory task
  const oratoryAssigner = async (numToAssign, userId) => {
    console.log("user has completed the previous task i should assign oratory");
    try {
      // Retrieve all subDialogues from the database where assignmentStatus is false
      const allOratory = await Oratory.find({ assignmentStatus: false }).limit(
        numToAssign
      );
      console.log(allOratory);
      //check number of retrieved subDialogues
      const numOfAllOratory = allOratory.length;

      // Iterate over the selected subDialogues
      for (let i = 0; i < numOfAllOratory; i++) {
        const oratoryItem = allOratory[i];

        // Create a new user task
        const newUserTask = new userTask({
          taskStatus: "Undone",
          oratoryId: oratoryItem._id,
          userId: userId,
          type: ORATORY,
        });

        try {
          // Attempt to save the new user task
          const savedUserTask = await newUserTask.save();
          // If the save operation succeeds, `savedUserTask` will contain the saved document
          console.log("User task saved successfully:", savedUserTask);

          // Update the assignmentStatus of the subDialogueItem
          await Oratory.findByIdAndUpdate(oratoryItem._id, {
            assignmentStatus: true,
          });
        } catch (error) {
          // If an error occurs during the save operation, it will be caught here
          console.error("Error saving user task:", error);
        }
      }

      //check if user id exits in dialogue task table and assigned a task, if not insert or update user task status true
      const existingTask = await DAstatus.findOne({ userId: userId });
      if (existingTask) {
        // If the user already has a task assigned, update its status to true
        existingTask.status = true;
        existingTask.taskType = ORATORY;
        await existingTask.save();
      } else {
        // If the user does not have a task assigned, insert a new document
        const newTask = new DAstatus({
          userId: userId,
          status: true,
          taskType: ORATORY,
        });
        await newTask.save();
      }
      console.log("everything checked out fine");
      // respondsSender(selectedSubDialogues, "User tasks created successfully!", ResponseCode.successful, res);
    } catch (error) {
      // respondsSender(error, "Error creating user tasks", ResponseCode.internalServerError, res);
    }
  };

  const foundDaStatus = await DAstatus.findOne({ userId });

  // Check if a document for the user is found
  if (foundDaStatus) {
    // console.log(`User found: ${userId}`);

    // Access taskType property of the found document
    const taskType = foundDaStatus.taskType;

    // Check the taskType and decide whether to assign dialogue or oratory tasks
    if (taskType === ORATORY) {
      // Assign oratory tasks
      await dialogueAssigner(numToAssign, userId);
    } else {
      // Assign dialogue tasks
      await oratoryAssigner(numToAssign, userId);
    }
  } else {
    // No document found for the user, assign dialogue tasks
    await dialogueAssigner(numToAssign, userId);
  }
};

module.exports = taskAssigner;
