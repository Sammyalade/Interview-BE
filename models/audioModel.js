const mongoose = require("mongoose");

const audioSchema = mongoose.Schema({
 translatedWord:{
    type: String,
    required: [true, "Please add word translated"],
    trim: true
},

wordId:{
    type: mongoose.Schema.Types.ObjectId, 
    required: [true, "Please add word id"],
    ref:"word",
},

languageTranslatedTo :{  
    type: String,
    required: [true, "Please add Language you translated to"],
    trim: true,
}, 

recordedVoice :{  
    type: String,
    required: [true, "Sound is needed"],
}, 

userId :{  
    type: mongoose.Schema.Types.ObjectId, 
    required: [true, "Please add contributor id"],
    trim: true,
    ref:"user",
}, 

},{
    timestamps: true,
});
const Audio = mongoose.model("Audio", audioSchema)
module.exports = Audio;
