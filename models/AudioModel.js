const mongoose = require("mongoose");

const audioSchema = mongoose.Schema({
wordName:{
    type: String,
    required: [true, "Please add a audio name"],
    trim: true
},
EnglishWord:{
    type: String,
    required: [true, "Please add a audio name"],
    trim: true
},

wordBank_Id:{
    type: mongoose.Schema.Types.ObjectId, 
    required: [true, "Please add word id"],
},
language :{  
    type: String,
    required: [true, "Please add a Language"],
    trim: true,
}, 
filePath :{  
    type: String,
    required: [true, "sound is needed"],
}, 
user_id :{  
    type: mongoose.Schema.Types.ObjectId, 
    required: [true, "Please add contributor id"],
    trim: true,
}, 

},{
    timestamps: true,
});
const Audio = mongoose.model("Audio", audioSchema)
module.exports = Audio;
