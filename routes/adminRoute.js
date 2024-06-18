const express = require("express");
const protect = require("../middleWare/authMiddleware");

const router = express.Router();

const {searchUser, getTaskDetails, getStats, getCompletedTasks, filterAnnotator, updateRoleToQA } = require("../controllers/Admin/adminController");


router.get("/searchuser", searchUser);
router.get("/taskdetails", getTaskDetails);
router.get("/dashboardstats" , getStats);
router.get("/getcompletedtasks" , getCompletedTasks);
router.get("/annotators" , filterAnnotator);
router.put("/assignqa", updateRoleToQA);


module.exports = router; 