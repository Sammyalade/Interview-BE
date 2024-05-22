const express = require("express");
const router = express.Router();
const { createFeedback, getSingleFeedback,getLimitFeedback, deleteFeedback, getAllFeedbacks, updateFeedback } = require("../controllers/feedbackController");
const protect = require("../middleWare/authMiddleware");


router.get("/all", protect("USER"), getAllFeedbacks); 
router.get("/limit/:limitId", protect("USER"), getLimitFeedback); 
router.post("/single", protect("USER"), getSingleFeedback); 
router.post("/create", protect("USER"), createFeedback);
router.patch("/update/:_id", protect("USER"), updateFeedback);  
router.delete("/delete/:_id", protect("USER"), deleteFeedback);

module.exports = router

