const mongoose = require("mongoose");
const { DIALOGUE, ORATORY } = require("../utils/constant");

const translateSchema = mongoose.Schema(
  {
    translateText: {
      type: String,
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
      required: [false, "id not included"],
      ref: ORATORY,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "id not included"],
      ref: "user",
    },
    language: {
      required: true,
      type: String,
    },
  },
  { timestamps: true }
);

const Translate = mongoose.model("Translate", translateSchema);

module.exports = Translate;
