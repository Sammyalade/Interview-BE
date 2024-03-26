const express = require("express");
const router = express.Router();
const { createWord, getWords, getSingleWord,getLimitWord, deleteWord, updateWord, createWordWithCsv } = require("../controllers/wordBankController");
const protect = require("../middleWare/authMiddleware");


router.get("/", getWords); 
router.get("/limit/:id", getLimitWord); 
router.post("/singleword", getSingleWord); 
router.post("/createword",  createWord) 
router.patch("/update/:id", protect, updateWord)  
router.delete("/delete/:id", deleteWord) 
// router.post("/createwordwithcsv",  createWordWithCsv) //route for csv upload

module.exports = router