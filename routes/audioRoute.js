const express = require("express");
const router = express.Router();
const {
  createAudio,
  getAudios,
  getAudio,
  deleteAudio,
  updateAudio,
} = require("../controllers/audioController");
const protect = require("../middleWare/authMiddleware");
// const { upload } = require("../utils/fileUpload");

router.post("/create", protect(), createAudio);
// router.patch("/:id",  upload.single("audio"), updateAudio) //upload.array for multiple file
router.get("/", protect(), getAudios);
router.post("/singleaudio", protect(), getAudio);
router.delete("/:id", protect(), deleteAudio);

module.exports = router;
