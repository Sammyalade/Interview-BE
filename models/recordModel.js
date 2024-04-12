const mongoose = require('mongoose');

const recordSchema = mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included "],
        ref: "user"
    },

    filePath: {
        type: String,
        required: true,
        unique: true,
        maxLength: 2048
    },

    dialogueId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included"],
        ref: "dialogue"
    },

    subDialogueId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included"],
        ref: "subDialogue"
    },

    status: {
        type: Boolean,
        required: true,
        default: false
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included"],
        ref: "user"
    }
});

const Record = mongoose.model("Record", recordSchema);

module.exports = Record