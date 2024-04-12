const express = require("express");
const router = express.Router();
const { saveRecording, saveTranslate, saveSpeak, test, skipTask, getMeter } = require("../controllers/taskController");
const protect = require("../middleWare/authMiddleware");


router.get("/test", test); 
router.post("/record", saveRecording); 
router.post("/translate", saveTranslate); 
router.post("/speak", saveSpeak); 
router.post("/skip", skipTask); 
router.get("/meter",getMeter)

module.exports = router

