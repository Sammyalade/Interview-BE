const mongoose = require("mongoose");

const WordBankSchema = mongoose.Schema({
EnglishWord:{
    type: String,
    required: [true, "Please add an EnglishWord"],
},

Yoruba :{  
    type: String,
    required: [true, "Please add a yoruba Transalation"],
},

Igbo :{  
    type: String,
    required: [true, "Please add a Igbo Translation"],
},

Hausa :{  
    type: String,
    required: [true, "Please add a Hausa"],
},

Definition :{  
    type: String,
    required: [true, "Please add Definition"],
},

},{
    timestamps: true,
});
const WordBank = mongoose.model("WordBank", WordBankSchema)

module.exports = WordBank