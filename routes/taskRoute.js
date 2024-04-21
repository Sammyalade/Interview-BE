const express = require("express");
const router = express.Router();
const { saveRecording, saveTranslate, saveSpeak, test, skipTask, getMeter, saveGeneratedFileInfo } = require("../controllers/taskController");
const protect = require("../middleWare/authMiddleware");


const multer = require('multer');
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

const { uploadToGCS } = require("../utils/GCPUploads");

// Use 'upload' middleware to handle file uploads
router.post('/upload', upload.single('file'), uploadToGCS, saveGeneratedFileInfo);


router.get("/test", test); 
router.post("/record",protect, upload.single('file'), uploadToGCS, saveRecording); 
router.post("/translate", protect, saveTranslate); 
router.post("/speak",protect, upload.single('file'), uploadToGCS, saveSpeak); 
router.post("/skip",protect, skipTask); 
router.get("/meter/:userId", protect, getMeter);

module.exports = router;
 