const mongoose = require('mongoose');

const userTaskSchema = mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included "],
        ref: "user"
    },

    userTaskStatus: {
        type: String,
        required: true,
        enum: ["Done", "Skipped", "Undone"],

    },

    subDialogueId: {
        type: mongoose.Schema.Types.ObjectI,
        required: [true, "id not included "],
        ref: "subDialogue"
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included"],
        ref: "user"
    }
})

const userTask = mongoose.model("userTask", userTaskSchema);

module.exports = userTask;