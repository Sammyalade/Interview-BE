const mongoose = require("mongoose");
const { USER } = require("../utils/constant");


const loginStatusSchema = mongoose.Schema({

    status: {
        type: Boolean,
        default: false,
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included "],
        ref: USER
    }
},

{ timestamps: true }
);

const LoginStatus = mongoose.model("LoginStatus", loginStatusSchema);

module.exports = LoginStatus;