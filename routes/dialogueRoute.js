const express = require("express");
const router = express.Router();
const { createDialogueWithDoc, getDialogue, getUserTasks, getUndoneTasks, getDoneTasks, getSkippedTasks } = require("../controllers/dialogueController");
const protect = require("../middleWare/authMiddleware");

const { upload } = require("../utils/fileUpload");

router.get("/", protect, getDialogue);
router.get("/getusertasks/:userId", protect, getUserTasks);
router.get("/getskippedtasks/:userId", protect, getSkippedTasks);
router.get("/getundonetasks/:userId", protect, getUndoneTasks);
router.get("/getdonetasks/:userId", protect, getDoneTasks);
router.post("/generate",  upload.single("dialogueDoc"), createDialogueWithDoc) //route for csv upload

/*
ROUTES
    // 1. Get a particular user dialogue tasks.
    // 2. Get a particular user dialogue undone tasks.
    // 3. Get a particular user dialogue skipped tasks.
    // 4. Get a particular user dialogue done tasks.
    5. Get a particular user total number of dialogue tasks assigned.
    6. Update total number of done tasks.
    7. Update a particular user dialogue tasks status.

*/

module.exports = router

