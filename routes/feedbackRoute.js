const express = require("express");
const router = express.Router();
const { createFeedback, getSingleFeedback,getLimitFeedback, deleteFeedback, getAllFeedbacks, updateFeedback } = require("../controllers/feedbackController");
const protect = require("../middleWare/authMiddleware");


router.get("/all", protect, getAllFeedbacks); 
router.get("/limit/:limitId", protect, getLimitFeedback); 
router.post("/single", protect, getSingleFeedback); 
router.post("/create", protect, createFeedback);
router.patch("/update/:_id", protect, updateFeedback);  
router.delete("/delete/:_id", protect, deleteFeedback);

module.exports = router

