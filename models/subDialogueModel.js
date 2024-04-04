const mongoose = require("mongoose");

const subDialogueSchema = mongoose.Schema({

    text: {
        type: String,
        required: true
    },

    dialogueId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included "],
        ref: "dialogue"
    },
    
    scenario: {
        type: String, 
    },

    assignmentStatus: {
        type: Boolean,
        required: true,
        default: false
    },

    skippedStatus: {
        type: Boolean,
        required: true,
        default: false
    }
});

const subDialogue = mongoose.model("subDialogue", subDialogueSchema);

module.exports = subDialogue;