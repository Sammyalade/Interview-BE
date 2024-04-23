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
const DAstatus = mongoose.model("DAstatus", daStatusSchema)
module.exports = DAstatus