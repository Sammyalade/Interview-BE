const mongoose = require('mongoose');

const userTaskSchema = mongoose.Schema({
    taskStatus: {
        type: String,
        required: true,
        enum: ["Done", "Skipped", "Undone"],

    },

    subDialogueId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included "],
        ref: "subDialogue"
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included"],
        ref: "user"
    },
    type: {
        type: String,
        required: true,
        default: "dialogue"
    }
})

const userTask = mongoose.model("userTask", userTaskSchema);

module.exports = userTask;