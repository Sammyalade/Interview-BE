const asyncHandler = require("express-async-handler");
const WordBank = require("../models/WordBankModel")


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
    const response={
        words:Word,
        RespondMessage:"successful",
        respondsCode:200
    }
    res.status(201).json(response);
});

// Get all Words

const getWords = asyncHandler(async (req, res) => {
    console.log("Fetching 10 random words");
    
    // Get the total count of documents in the collection
    const totalCount = await WordBank.countDocuments();

    // Generate 10 random indices
    const randomIndices = [];
    while (randomIndices.length < 10) {
        const randomIndex = Math.floor(Math.random() * totalCount);
        if (!randomIndices.includes(randomIndex)) {
            randomIndices.push(randomIndex);
        }
    }

    // Find documents using the random indices
    const randomWords = await WordBank.find().skip(...randomIndices).limit(10);

    const response = {
        words: randomWords,
        RespondMessage: "successful",
        respondsCode: 200
    };

    res.status(200).json(response);
});

 const getSingleWord = asyncHandler(async(req, res) =>{
    
    const {_id} = req.body
    if (!_id) {
        return res.status(400).json({ error: 'Please pass an _id' });
    }
    const Word = await WordBank.find({_id}).sort("-createdAt");
    const response={
        word:Word[0],
        RespondMessage:"successful",
        respondsCode:200
    }
    res.status(200).json(response);
 })

 // Custom validation function (you can replace this with your own validation logic)
const isValidWord = (id) => {
   
    return id && typeof id === 'string' && id.length > 0;
};
 const getLimitWord = asyncHandler(async (req, res) => {
    const { id } = req.params;

    console.log(id);
    // Validate that id is a valid word (customize the validation logic as needed)
    if (!isValidWord(id)) {
        return res.status(400).json({ error: 'Invalid word ID' });
    }

    const Words = await WordBank.find({}).sort("-createdAt").limit(id);
    res.status(200).json(Words);
});


 // Get a Single Word
 const getWord = asyncHandler(async(req,res) =>{
    const { id } = req.params;
    const Word = await WordBank.findById(id)
    
    // if Word Doesn't Exist
    if (!Word){
        res.status(404)
        throw new Error("Word not found");
    }

    res.status(200).json(Word);
 })
// Delete Word
const deleteWord = asyncHandler(async (req, res) => {
    const wordId = req.params.id;
  
    // Find the Word by ID
    const word = await WordBank.findById(wordId);
  
    // If Word Doesn't Exist
    if (!word) {
      res.status(404).json({ error: "Word not found" });
      return;
    }
  
    // Remove the Word
    await word.remove();
  
    res.status(200).json({ message: "Word Deleted" });
  });
  

    //Update Word
    const updateWord = asyncHandler (async (req, res) =>{
        const {EnglishWord, Yoruba, Igbo, Hausa, Id} = req.body;

        const Word = await WordBank.findById(Id)

        // if Word doesn't exist
        if (!Word){
            res.status(404)
            throw new Error("Word not found");
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

        
        res.status(200).json(updatedWord)
    
    })
    

    const fs = require('fs');
const csv = require('csv-parser');
    
// createWordWithCsv
const createWordWithCsv = asyncHandler(async(req,res) =>{
    const {csvFilePath} = req.body;
    if(!csvFilePath){
        //return error
        console.log("CSV  file not found");
        
        res.status(500)
             throw new Error ("CSV could not be uploaded")
    }
    // Read and parse the CSV file
  fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Create a new document based on your Mongoose model
    const newDocument = new WordBank({
      // Map CSV column names to Mongoose model fields
      field1: row.column1,
      field2: row.column2,
      // Add more fields as needed
    });

    // Save the document to the database
    newDocument.save()
      .then(() => console.log('Document saved to the database'))
      .catch((saveError) => console.error('Error saving document:', saveError));
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
    // Close the MongoDB connection after processing the CSV
    mongoose.connection.close();
  });
    res.status(200).json({message: "this endpoint is onot reay"});
 })

    
module.exports = {
    createWord, getWords, getSingleWord,getLimitWord, deleteWord, updateWord, createWordWithCsv

}