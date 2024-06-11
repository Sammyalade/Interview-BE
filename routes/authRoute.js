const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  logout,
  getUser,
  loginStatus,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyUser,
} = require("../controllers/authController");
const adminProtect = require("../middleWare/adminAuthMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/getuser", adminProtect(), getUser);
router.get("/loginstatus", adminProtect(), loginStatus);
router.patch("/changepassword", adminProtect(), changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/", resetPassword);
router.get("/verify/:id/", verifyUser);

module.exports = router;
