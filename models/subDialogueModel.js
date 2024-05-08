const mongoose = require("mongoose");

const subDialogueSchema = mongoose.Schema({

    text: {
        type: String,
        required: true
    },
    identifier: {
        type: String,
        required: false
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

const SubDialogue = mongoose.model("SubDialogue", subDialogueSchema);

module.exports = SubDialogue;