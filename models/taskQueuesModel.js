const mongoose = require("mongoose");
const { USER, UNDONE, REJECTED, COMPLETED } = require("../utils/constant");


const taskQueuesSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included "],
        ref: USER
    },

    language: {
        type: String,
        required: false
    },

    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "userTask"
    },

    annotatorStatus: {
        type: Boolean,
        default: false
    },

    annotatorRemark: {
        type: String,
        default: UNDONE,
        enum: [UNDONE, REJECTED, COMPLETED]
    },

    auditorStatus: {
        type: Boolean,
        default: false
    },

    auditorRemark: {
        type: String,
        default: UNDONE,
        enum: [UNDONE, REJECTED, COMPLETED]
    }
},

{ timestamps: true }
);

const TaskQueuesStatus = mongoose.model("TaskQueuesStatus", taskQueuesSchema);

module.exports = TaskQueuesStatus;