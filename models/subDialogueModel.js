const mongoose = require("mongoose");
const { DIALOGUE } = require("../utils/constant");

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
        ref: DIALOGUE
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
}, { timestamps: true });

const SubDialogue = mongoose.model("SubDialogue", subDialogueSchema);

module.exports = SubDialogue;