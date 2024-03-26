const asyncHandler = require("express-async-handler");
const Audio = require("../models/AudioModel")
const { respondsSender } = require('../middleWare/respondsHandler');
const { ResponseCode } = require('../utils/responseCode');

const testAudio = asyncHandler (async(req, res)=>{
    respondsSender(null, "This EndPoint works", ResponseCode.successful, res);})


// Create Audio
const createAudio = asyncHandler(async (req, res) => {
        const { userId, translatedWord, languageTranslatedTo, recordedVoice, wordId } = req.body;
    
        // Validation
        if (!userId || !translatedWord || !languageTranslatedTo || !recordedVoice || !wordId) {
            return respondsSender(null, "Please fill in all fields: userId, translatedWord, languageTranslatedTo, recordedVoice, wordId", ResponseCode.badRequest, res);
        }
    
        try {
            // Create Audio
            const createdAudio = await Audio.create({
                recordedVoice,
                translatedWord,
                languageTranslatedTo,
                wordId,
                recordedVoice,
                userId
            });
    
            // Check if creation was successful
            if (createdAudio) {
                respondsSender(createdAudio, "Audio created successfully", ResponseCode.successful, res);
            } else {
                respondsSender(null, "Failed to create audio", ResponseCode.internalServerError, res);
            }
        } catch (error) {
            respondsSender(null, "An error occurred while creating audio", ResponseCode.internalServerError, res);
        }
});
 

// Get all Audios
 const getAudios = asyncHandler(async(req, res) =>{
    const Audios = await Audio.find().sort("-createdAt");
    respondsSender(Audios, "All audio files gotten successfully", ResponseCode.successful, res);
 })


 // Get a Single Audio
 const getAudio = asyncHandler(async(req,res) =>{
    const{_id}=req.body;
    if (!_id) {
        respondsSender(null, "Please pass an id", ResponseCode.badRequest, res);
    }
    const fetchedAudio = await Audio.findById(_id)
    
    // if Audio Doesn't Exist
    if (!fetchedAudio){
        respondsSender(null, "No Audio Found", ResponseCode.noData, res);
    }
    respondsSender(fetchedAudio, "Audio found successfully", ResponseCode.successful, res);
 })


 // Delete Audio
 const deleteAudio = asyncHandler(async(req,res) =>{
    if (!req.params.id) {
        respondsSender(null, "Please pass an id", ResponseCode.badRequest, res);
    }
    const deletedAudio = await Audio.findById(req.params.id)
    
    // if Audio Doesn't Exist
    if (!deletedAudio){
        respondsSender(null, "Audio not found", ResponseCode.noData, res);
    }

    await deletedAudio.remove()
    respondsSender(null, "Audio Deleted", ResponseCode.successful, res);
 })


 //Update Audio
const updateAudio = asyncHandler (async (req, res) =>{
        const {userId, translatedWord, languageTranslatedTo, recordedVoice} = req.body
        // validation
        if (!userId|| !translatedWord || !languageTranslatedTo || !recordedVoice  ) {
            respondsSender(null, "please fill in all fields", ResponseCode.badRequest, res);
        }
        const AudioToUpdate = await Audio.findById(_id)
        

        // if Word doesn't exist
        if (!AudioToUpdate){
            
            respondsSender(null, "Audio not found", ResponseCode.badRequest, res);  

        }   
        //update Word
        const updatedAudio = await Audio.findByIdAndUpdate({_id},
             { 
                recordedVoice,
                translatedWord,
                languageTranslatedTo,
                recordedVoice
            },
            {
                new: true,
                runValidators: true
            });
        respondsSender(updatedWord, "Audio updated successfully", ResponseCode.successful, res);  
      
})
    

    
module.exports = {
    createAudio,
    getAudios,
    getAudio,
    deleteAudio,
    updateAudio,

}