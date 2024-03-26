const asyncHandler = require("express-async-handler");
const Feedback = require("../models/feedbackModel")
const { respondsSender } = require('../middleWare/respondsHandler');
const { ResponseCode } = require('../utils/responseCode');

// Create Feedback
const createFeedback = asyncHandler(async (req, res) => {
    const { wordId, userId, wordLanguage, userTranslation } = req.body;
    //optional 
    const remark = req.body.remark ?? "No Remark";
    // Validation
    if (!wordId || !userId || !wordLanguage || !userTranslation) {
        res.status(400).json({ error: "Please fill in all fields" });
        return; // Added return to exit the function after sending the response
    }

    //check if user already made that suggestion and return error to avoid duplication
    try {
        // Get all Feedbacks from the Feedback collection
        const feedback = await Feedback.findOne({ userId, wordId, wordLanguage, userTranslation });

            if (feedback) {
            // A document with exact matching values exists in the Feedback collection
            respondsSender(null, "Your feedback has already been saved", ResponseCode.dataDuplication, res);
            } else {
            // No matching document found add suggestion to db
            const createdFeedback = await Feedback.create({
                wordId,
                userId,
                wordLanguage,
                userTranslation,
                remark,
            });
            const data={
                Feedbacks:createdFeedback
            }
            respondsSender(data, "Feedback successfully created", ResponseCode.successful, res);

            }
        
      } catch (error) {
        // Handle any errors that may occur during the database query
        respondsSender(null, "Internal Server Error"+error.message, ResponseCode.internalServerError , res);


    }
});


// Get all Feedbacks
const getAllFeedbacks = asyncHandler(async (req, res) => {
    
    
    try {
        // Get all Feedbacks from the Feedback collection
        const allFeedbacks = await Feedback.find({});
      
        // Prepare the response object
        const data={
            Feedbacks:allFeedbacks
        }
      
        respondsSender(data, "All feedbacks successfully displayed", ResponseCode.successful, res);
      } catch (error) {
        // Handle any errors that may occur during the database query
        respondsSender(data, "Internal Server Error"+error, ResponseCode.internalServerError , res);


    }
      
});


// Get single feedback
const getSingleFeedback = asyncHandler(async(req, res) =>{
    
    const {_id} = req.body
    if (!_id) {
        respondsSender(null, "Please pass an _id", ResponseCode.badRequest, res);
    }
    const Feedback = await Feedback.find({_id}).sort("-createdAt");
    const data={
        Feedback:Feedback[0]
    }
    
    respondsSender(data, "Feedback successfully gotten", ResponseCode.successful, res);

});


// Custom validation function (you can replace this with your own validation logic) to get Limited number of feedback
const isValidFeedback = (limitId) => {
   
    return limitId && typeof limitId === 'string' && limitId.length > 0;
};
const getLimitFeedback = asyncHandler(async (req, res) => {
    const { limitId } = req.params;

    console.log(limitId);
    // Validate that id is a valid Feedback (customize the validation logic as needed)
    if (!isValidFeedback(limitId)) {
        respondsSender(null, "Invalid Feedback ID", ResponseCode.badRequest, res);
    }

    const Feedbacks = await Feedback.find({}).sort("-createdAt").limit(limitId);
    
    respondsSender(Feedbacks, `${limitId} Feedbacks displayed successfully`, ResponseCode.successful, res);
});


// Delete a single Feedback
const deleteFeedback = asyncHandler(async (req, res) => {
    const { _id } = req.params;
    console.log(_id);
    if (!_id) {
        respondsSender(null, "Please pass an _id", ResponseCode.badRequest, res);  
    }
  
    // Find the Feedback by ID
    const foundFeedback = await Feedback.findById(_id);
  
    // If Feedback Doesn't Exist
    if (!foundFeedback) {
      respondsSender(null, "Feedback not found", ResponseCode.badRequest, res);  

    }
  
    // Remove the Feedback
    const deletedFeedback = await foundFeedback.delete();
  
    respondsSender(deletedFeedback, "Feedback deleted", ResponseCode.successful, res);  

});
  

//Update a Feedback
const updateFeedback = asyncHandler (async (req, res) =>{
        const { wordId, userId, wordLanguage, userTranslation } = req.body;
        const { _id } = req.params;
        //optional 
        const remark = req.body.remark ?? "No Remark";
        // Validation
        if (!wordId || !userId || !wordLanguage || !userTranslation || !_id) {
            respondsSender(null, "Please fill in all fields", ResponseCode.noData, res);  
        }

        const foundFeedback = await Feedback.findById(_id)

        // if Feedback doesn't exist
        if (!foundFeedback){
            
            respondsSender(null, "Feedback not found", ResponseCode.noData, res);  

        }

        
        //update Feedback
        const updatedFeedback = await Feedback.findByIdAndUpdate({_id},
             { 
                wordId, userId, wordLanguage, userTranslation
            },
            {
                new: true,
                runValidators: true
            });
        respondsSender(updatedFeedback, "Update successful", ResponseCode.successful, res);  

});
    


    
module.exports = {
    createFeedback, getSingleFeedback, getLimitFeedback, deleteFeedback, updateFeedback,
    getAllFeedbacks
}