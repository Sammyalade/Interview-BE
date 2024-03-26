const express = require("express");
const router = express.Router();
const { createAudio, getAudios, getAudio, deleteAudio, updateAudio ,testAudio} = require("../controllers/audioController");
const protect = require("../middleWare/authMiddleware");
const { upload } = require("../utils/fileUpload");



// router.post("/", protect, upload.single("image"), createAudio) //upload.array for multiple file 
router.post("/", createAudio)
// router.patch("/:id",  upload.single("audio"), updateAudio) //upload.array for multiple file 
// router.get("/",  getAudios); 
// router.get("/:id",  getAudio); 
// router.delete("/:id", protect, deleteAudio) 

router.get("/test", testAudio) 

module.exports = router 