const mongoose = require("mongoose");
const { USER, DISABLED, ACTIVE, REMOVED } = require("../utils/constant");


const annotatorAuditorSchema = mongoose.Schema({
    status: {
        type: String,
        default: ACTIVE,
        enum: [ACTIVE, DISABLED, REMOVED]
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included "],
        ref: USER
    }
},

{ timestamps: true }
);

const AnnotatorAuditorStatus = mongoose.model("AnnotatorAuditorStatus", annotatorAuditorSchema);

module.exports = AnnotatorAuditorStatus;