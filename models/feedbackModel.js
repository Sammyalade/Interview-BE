const mongoose = require("mongoose");

const FeedbackSchema = mongoose.Schema({
    wordId:{
       
        required: [true, "Please add an Word Id"],
        type: mongoose.Schema.Types.ObjectId,
        ref:"word",
    },
    userId:{
        required: [true, "Please User Id is needed"],
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    wordLanguage :{  
    type: String,
    required: [true, "Please add the language of the word"],
}, 
userTranslation :{  
    type: String,
    required: [true, "Please tell us your translation"],
}, 
remark :{  
    type: String,
    default:"No Remark"
}
},{
    timestamps: true,
});
const Feedback = mongoose.model("Feedback", FeedbackSchema)
module.exports = Feedback;
 