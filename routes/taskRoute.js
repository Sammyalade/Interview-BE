const express = require("express");
const router = express.Router();
const {
  saveRecording,
  saveTranslate,
  saveSpeak,
  test,
  skipTask,
  getMeter,
} = require("../controllers/taskController");
const protect = require("../middleWare/authMiddleware");

const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

const { uploadToGCS } = require("../utils/GCPUploads");

router.get("/test", test);
router.post("/record", upload.single("file"), uploadToGCS, saveRecording);
router.post("/translate", protect("USER"), saveTranslate);
router.post("/speak", upload.single("file"), uploadToGCS, saveSpeak);
router.post("/skip", protect("USER"), skipTask);
router.get("/meter/:userId", protect("USER"), getMeter);

module.exports = router;

