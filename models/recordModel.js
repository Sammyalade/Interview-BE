const mongoose = require("mongoose");
const { ORATORY, DIALOGUE } = require("../utils/constant");

const recordSchema = mongoose.Schema(
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
  },
  { timestamps: true }
);

const Record = mongoose.model("Record", recordSchema);

module.exports = Record;
