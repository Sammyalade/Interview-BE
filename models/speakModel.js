const mongoose = require('mongoose');

const speakSchema = mongoose.Schema({
   
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
    },
      language:{
        require:true,
        type:String
    }
});

const Speak = mongoose.model("Speak", speakSchema);

module.exports = Speak