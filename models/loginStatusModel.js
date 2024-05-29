const mongoose = require("mongoose");
const { USER } = require("../utils/constant");

const loginStatusSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    default: false,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "id not included"],
    ref: USER
  }
}, { timestamps: true });

// Check if the model is already compiled before defining it
const AuthLoginStatus = mongoose.models.LoginStatus || mongoose.model("LoginStatus", loginStatusSchema);

module.exports = AuthLoginStatus;
