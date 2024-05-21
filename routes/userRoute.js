const express = require("express");

const router = express.Router();

const { registerUser,
    loginUser,
    logout, loginStatus, updateUser, changePassword, forgotPassword, resetPassword, getUser, verifyUser, getAccent, runUserUpdate } = require("../controllers/userController");
const protect = require("../middleWare/authMiddleware");

router.post("/register", registerUser);
router.get("/verify/:id/", verifyUser);
router.get("/getaccent", getAccent);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/getuser", protect("USER"), getUser);
router.get("/loginstatus", protect("USER"), loginStatus);
router.patch("/updateuser", protect("USER"), updateUser);
router.patch("/changepassword", protect("USER"), changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/", resetPassword);
router.get("/runupdate/", runUserUpdate);

module.exports = router        