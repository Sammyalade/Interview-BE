const express = require("express");
const router = express.Router();
const { createWord, getWords, getSingleWord,getLimitWord, deleteWord, getAllWords, updateWord, createWordWithCsv } = require("../controllers/wordBankController");
const protect = require("../middleWare/authMiddleware");

const { upload } = require("../utils/fileUpload");

router.get("/", protect("USER"), getWords); 
router.get("/all",protect("USER"), getAllWords); 
router.get("/limit/:id",protect("USER"), getLimitWord); 
router.post("/singleword",protect("USER"), getSingleWord); 
router.post("/createword",protect("USER"),  createWord) 
router.patch("/update/:id", protect("USER"), updateWord)  
router.delete("/delete/:id",protect("USER"), deleteWord) 
 router.post("/createwordwithcsv",  upload.single("csvFile"), createWordWithCsv) //route for csv upload

module.exports = router

