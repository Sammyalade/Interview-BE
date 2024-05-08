const mongoose = require('mongoose');

const userTaskSchema = mongoose.Schema({
    taskStatus: {
        type: String,
        required: true,
        default:"Undone",
        enum: ["Done", "Skipped", "Undone"],

    },
      taskStage: {
        type: Number,
        required: true,
        default:1,

    },

    subDialogueId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [false, "id not included "],
        ref: "subDialogue"
    },
    
    oratoryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [false, "id not included "],
        ref: "oratory"
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

const UserTask = mongoose.model("UserTask", userTaskSchema);

module.exports = UserTask