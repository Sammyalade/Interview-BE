const express = require("express");
const router = express.Router();
const {
  createWord,
  getWords,
  getSingleWord,
  getLimitWord,
  deleteWord,
  getAllWords,
  updateWord,
  createWordWithCsv,
} = require("../controllers/wordBankController");
const protect = require("../middleWare/authMiddleware");

const { upload } = require("../utils/fileUpload");

router.get("/", protect(), getWords);
router.get("/all", protect(), getAllWords);
router.get("/limit/:id", protect(), getLimitWord);
router.post("/singleword", protect(), getSingleWord);
router.post("/createword", protect(), createWord);
router.patch("/update/:id", protect(), updateWord);
router.delete("/delete/:id", protect(), deleteWord);
router.post("/createwordwithcsv", upload.single("csvFile"), createWordWithCsv); //route for csv upload

module.exports = router;
