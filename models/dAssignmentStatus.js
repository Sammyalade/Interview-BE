const mongoose = require("mongoose");

const daStatusSchema = mongoose.Schema({
userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
},
status: {
    type: Boolean,
    default: false,
    requires: true

},},

{timestamps: true,})
const daStatus = mongoose.model("daStatus", daStatusSchema)
module.exports = daStatus