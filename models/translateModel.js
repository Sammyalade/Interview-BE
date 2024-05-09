const mongoose = require('mongoose');

const translateSchema = mongoose.Schema({
    
    translateText: {
        type: String
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
        required: [false, "id not included"],
        ref: "oratory"
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "id not included"],
        ref: "user"
    },
    language:{
        require:true,
        type:String
    }
}, { timestamps: true });

const Translate = mongoose.model("Translate", translateSchema);

module.exports = Translate