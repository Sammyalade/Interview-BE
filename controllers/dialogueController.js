const asyncHandler = require("express-async-handler");
const dialogueModel = require("../models/dialogueModel");
const subBdialogueModel = require("../models/dialogueModel");
const { respondsSender } = require('../middleWare/respondsHandler');
const { ResponseCode } = require('../utils/responseCode');


//route functions
const createWord = asyncHandler(async (req, res) => {
    const { EnglishWord, Yoruba, Igbo, Hausa, Definition } = req.body;
    // Validation
    if (!EnglishWord || !Yoruba || !Igbo || !Hausa || !Definition) {
        res.status(400).json({ error: "Please fill in all fields" });
        return; // Added return to exit the function after sending the response
    }

    // Create Word
    const Word = await WordBank.create({
        Hausa,
        Igbo,
        Yoruba,
        EnglishWord,
        Definition,
    });
    const data={
        words:Word
    }
    respondsSender(data, "successful", ResponseCode.successful, res);
});

// Get all Words
const getWords = asyncHandler(async (req, res) => {
    console.log("Fetching 10 random words");

    // Use MongoDB $sample to get a random sample of 10 documents
    const randomWords = await WordBank.aggregate([
        { $sample: { size: 10 } }
    ]);

    const data = {
        words: randomWords
    };

    respondsSender(data, "successful", ResponseCode.successful, res);
});

// Get all Words

const getAllWords = asyncHandler(async (req, res) => {
    
    
    try {
        // Get all words from the WordBank collection
        const allWords = await WordBank.find({});
        const data={
            words:allWords
        }
      
        respondsSender(data, "successful", ResponseCode.successful, res);
      } catch (error) {
        // Handle any errors that may occur during the database query
        console.error("Error fetching words:", error);
        
        respondsSender(null, "Internal Server Error"+error, ResponseCode.internalServerError , res);


    }
      
});


const getSingleWord = asyncHandler(async (req, res) => {
    
    const {_id} = req.body
    if (!_id) {
        respondsSender(null, "Please pass an _id", ResponseCode.badRequest, res);
    }
    const Word = await WordBank.find({_id}).sort("-createdAt");
    const data={
        word:Word[0]
    }
    
    respondsSender(data, "successful", ResponseCode.successful, res);

});


// Custom validation function (you can replace this with your own validation logic)
const isValidWord = (id) => {
   
    return id && typeof id === 'string' && id.length > 0;
};
const getLimitWord = asyncHandler(async (req, res) => {
    const { id } = req.params;

    console.log(id);
    // Validate that id is a valid word (customize the validation logic as needed)
    if (!isValidWord(id)) {
        respondsSender(null, "Invalid word ID", ResponseCode.badRequest, res);
    }

    const Words = await WordBank.find({}).sort("-createdAt").limit(id);
    
    respondsSender(Words, "successful", ResponseCode.successful, res);
});


// Delete Word
const deleteWord = asyncHandler(async (req, res) => {
    const wordId = req.params.id;
  
    // Find the Word by ID
    const word = await WordBank.findById(wordId);
  
    // If Word Doesn't Exist
    if (!word) {
      respondsSender(null, "Word not found", ResponseCode.badRequest, res);  

    }
  
    // Remove the Word
    await word.remove();
  
    respondsSender(null, "word deleted", ResponseCode.successful, res);  

});
  

//Update Word
const updateWord = asyncHandler (async (req, res) => {
        const { EnglishWord, Yoruba, Igbo, Hausa, Definition, _id } = req.body;
        // Validation
        if (!EnglishWord || !Yoruba || !Igbo || !Hausa || !Definition || !_id) {
            respondsSender(null, "Please fill in all fields", ResponseCode.badRequest, res);  
        }

        const Word = await WordBank.findById(Id)

        // if Word doesn't exist
        if (!Word){
            
            respondsSender(null, "word not found", ResponseCode.noData, res);  

        }

        
        //update Word

        const updatedWord = await WordBank.findByIdAndUpdate({_id: id},
             { 
                EnglishWord, Yoruba, Igbo, Hausa, Id,
            },
            {
                new: true,
                runValidators: true
            });
        respondsSender(updatedWord, "successful", ResponseCode.successful, res);  

});
    


const csvtojson = require('csvtojson');
const createWordWithCsv = asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        respondsSender(null, "File not found", ResponseCode.badRequest, res);  
      }
  
      // Access the path of the uploaded file
      const filePath = req.file.path;
  
      // Convert CSV buffer to JSON using csvtojson library
      const jsonData = await csvtojson().fromFile(filePath);
      if (!jsonData) {
        respondsSender(null, "Json could not be converted", ResponseCode.noData, res); 
      }
      //upload the json into db

      

      // Iterate through JSON data and check if each document exists, then merge or insert accordingly
      for (const item of jsonData) {
        const existingDocument = await WordBank.findOne({ "EnglishWord": item["EnglishWord"], "Definition":item["Definition"] });
  
        if (existingDocument) {
          // Merge data if document exists
          await WordBank.updateOne({ "_id": existingDocument["_id"] }, { "$set": item });
        } else {
          // Insert new document if it doesn't exist
          await WordBank.create(item);
        }
      }
  
      console.log('Data uploaded successfully.');

      // Send the JSON data and file path in the response
      respondsSender(null, "file uploaded and merged to db", ResponseCode.successful, res); 
    } catch (error) {
      respondsSender(null, "Internal Server Error"+error, ResponseCode.internalServerError, res); 
    }
  });
  
  
    
module.exports = {
    createWord,
    getWords,
    getSingleWord,
    getLimitWord,
    deleteWord,
    updateWord,
    createWordWithCsv,
    getAllWords
}