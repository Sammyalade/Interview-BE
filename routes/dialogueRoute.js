const express = require("express");
const router = express.Router();
const { createDialogueWithDoc, getDialogue } = require("../controllers/dialogueController");
const protect = require("../middleWare/authMiddleware");

const { upload } = require("../utils/fileUpload");

router.get("/", protect, getDialogue); 
router.post("/generate",  upload.single("dialogueDoc"), createDialogueWithDoc) //route for csv upload

module.exports = router

