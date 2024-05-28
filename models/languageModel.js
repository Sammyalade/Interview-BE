const { language } = require("googleapis/build/src/apis/language");
const mongoose = require("mongoose");

const languageSchema = mongoose.Schema(
  {
    languages: {
      type: String,
      required: true,
      unique: true,
    },
  }
);

const Language = mongoose.model("Language", languageSchema);

module.exports = Language;
