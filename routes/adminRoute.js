const express = require("express");
const protect = require("../middleWare/authMiddleware");

const router = express.Router();

const {searchUser, getTaskDetails } = require("../controllers/adminController");


router.get("/searchuser", searchUser);
router.get("/taskdetails", getTaskDetails);

module.exports = router; 