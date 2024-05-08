const mongoose = require("mongoose");

const oratorySchema = mongoose.Schema({

    text: {
        type: String,
        required: true
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
});

const Oratory = mongoose.model("Oratory", oratorySchema);

module.exports = Oratory;