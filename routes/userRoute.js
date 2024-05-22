const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  logout,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  getUser,
  verifyUser,
  getAccent,
} = require("../controllers/userController");
const protect = require("../middleWare/authMiddleware");

router.post("/register", registerUser);
router.get("/verify/:id/", verifyUser);
router.get("/getaccent", getAccent);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/getuser", protect, getUser);
router.get("/loginstatus", protect, loginStatus);
router.patch("/updateuser", protect, updateUser);
router.patch("/changepassword", protect, changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/", resetPassword);

module.exports = router;
