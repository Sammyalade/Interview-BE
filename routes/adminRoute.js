const express = require("express");
const protect = require("../middleWare/authMiddleware");

const router = express.Router();

const {searchUser, getTaskDetails, getStats, getCompletedTasks } = require("../controllers/Admin/adminController");


router.get("/searchuser", searchUser);
router.get("/taskdetails", getTaskDetails);
router.get("/dashboardstats" , getStats);
router.get("/getcompletedtasks" , getCompletedTasks);

module.exports = router; 