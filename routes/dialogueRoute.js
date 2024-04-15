const express = require("express");
const router = express.Router();
const {
  createDialogueWithDoc,
  getDialogue,
  getUserTasks,
  getUndoneTasks,
  getDoneTasks,
  getSkippedTasks,
  getSingleTask,
} = require("../controllers/dialogueController");
const protect = require("../middleWare/authMiddleware");

const { upload } = require("../utils/fileUpload");

router.get("/", protect, getDialogue);
router.get("/getusertasks/:userId",protect, getUserTasks);
router.get("/getsingletask/:userId",protect, getSingleTask);
router.get("/getskippedtasks/:userId",protect, getSkippedTasks);
router.get("/getundonetasks/:userId",protect, getUndoneTasks);
router.get("/getdonetasks/:userId",protect, getDoneTasks);
router.post("/generate", upload.single("dialogueDoc"), createDialogueWithDoc); //route for csv upload

/*
ROUTES
    // 1. Get all tasks of a user.
    // 2. Get all undone tasks of a user.
    // 3. Get a single task of a user.
    // 4. Get all skipped tasks of a user.
    // 5. Get all done tasks of a user.
    6. Get a particular user total number of dialogue tasks assigned.
    7. Update total number of done tasks.
    8. Update a particular user dialogue tasks status.
     //remover A: and B: from every subdialod as **MOSES REQUESTED

*/

module.exports = router;
