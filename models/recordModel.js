const mongoose = require('mongoose');

const recordSchema = mongoose.Schema({
   
    filePath: {
        type: String,
        required: true,
      
       
    },
    fileLink: {
        type: String,
        required: true,
        
       
    },

    fileName: {
        type: String,
        required: true,
       
       
    },

    dialogueId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [false, "id not included"],
        ref: "dialogue"
    },

    subDialogueId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [false, "id not included"],
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
    }
}, { timestamps: true });

const Record = mongoose.model("Record", recordSchema);

module.exports = Record