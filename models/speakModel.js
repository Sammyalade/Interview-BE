const mongoose = require("mongoose");
const { DIALOGUE, ORATORY } = require("../utils/constant");

const speakSchema = mongoose.Schema(
  {
    filePath: {
      type: String,
      required: true,
      unique: false,
    },
    fileLink: {
      type: String,
      required: true,
      unique: true,
    },

    fileName: {
      type: String,
      required: true,
      unique: true,
    },

    dialogueId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [false, "id not included"],
      ref: DIALOGUE,
    },

    subDialogueId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [false, "id not included"],
      ref: "subDialogue",
    },

    oratoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [false, "id not included "],
      ref: ORATORY,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "id not included"],
      ref: "user",
    },
    language: {
      require: true,
      type: String,
    },
  },
  { timestamps: true }
);

const Speak = mongoose.model("Speak", speakSchema);

module.exports = Speak;
