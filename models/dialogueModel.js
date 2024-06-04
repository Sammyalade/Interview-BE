const mongoose = require("mongoose");

const dialogueSchema = mongoose.Schema({
    
    title: {
        type: String,
        required: true
    },
    domain: {
        type: String,
         default:"not specified"
    },
    scenario: {
        type: String,
           default:"not specified"
    },

}, { timestamps: true });

// Pre-save  to generate an incrementing title
dialogueSchema.pre("save", async function(next) {
    try {
        // Check if there are any documents in the collection
        const count = await this.constructor.countDocuments();
        
        // Set the title based on the count
        this.title = `Dialogue ${count + 1}`;

        // Continue with the save operation
        next();
    } catch (err) {
        // Handle any errors
        next(err);
    }
});

const Dialogue = mongoose.model("Dialogue", dialogueSchema);

module.exports = Dialogue;
