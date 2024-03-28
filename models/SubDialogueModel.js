const mongoose = require("mongoose");

const subDialogueSchema = mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included "],
        ref: "user"
    },

    text: {
        type: String,
        required: true
    },

    dialogueId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included "],
        ref: "dialogue"
    },

    assignmentStatus: {
        type: Boolean,
        required: true,
        default: false
    },

    skippedStatus: {
        type: Boolean,
        required: true,
        default: true
    }
});

const subDialogue = mongoose.model("subDialogue", subDialogueSchema);

module.exports = subDialogue;