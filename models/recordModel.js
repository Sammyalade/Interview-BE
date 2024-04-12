const mongoose = require('mongoose');

const recordSchema = mongoose.Schema({
   
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

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included"],
        ref: "user"
    }
});

const Record = mongoose.model("Record", recordSchema);

module.exports = Record