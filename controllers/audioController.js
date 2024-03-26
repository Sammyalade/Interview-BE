const asyncHandler = require("express-async-handler");
const Audio = require("../models/WordBankModel")
const {fileSizeFormatter} = require( "../utils/fileUpload");
const cloudinary = require ("cloudinary").v2;

const testAudio = asyncHandler (async(req, res)=>{
    res.status(201).json("this works");
})

const createAudio = asyncHandler (async (req, res) =>{
    const {user, name, language, filePath, description} = req.body
    
    // validation
    if (!user|| !name || !language || !filePath  ) {
        res.status(400)
        throw new error ("please fill in all fields")
    }

    //Handle  Audio uploads
// let fileData = {}
// if(req.file){
//     // Save Audio to Cloudinary
//     let uploadedFile;
//         try {
//             uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder: name, resource_type: "video"})
//         } catch (error){
//             res.status(500)
//             throw new Error ("sound could not be uploaded")
//         }
//     fileData = {
//         fileName: req.file.originalname,
//         filePath: uploadedFile.secure_url,
//         filetype: req.file.mimetype,
//         fileSize: fileSizeFormatter(req.file.size, 2),
        
//     } 
// }

  //Create Audio
  // const Audio = await Audio.create({
  //   // user: req.user.id,
  //   wordName,
  //   language,
  //   filepath: filePath,
  // });

  res.status(201).json("this works" + wordName);
});


// // Get all Audios
//  const getAudios = asyncHandler(async(req, res) =>{
//     const Audios = await Audio.find().sort("-createdAt");
//     res.status(200).json(Audios);
//  })

//  // Get a Single Audio
//  const getAudio = asyncHandler(async(req,res) =>{
//     const Audio = await Audio.findById(req.params.id)

//     // if Audio Doesn't Exist
//     if (!Audio){
//         res.status(404)
//         throw new Error("Audio not found");
//     }
//     res.status(200).json(Audio);
//  })

//  // Delete Audio
//  const deleteAudio = asyncHandler(async(req,res) =>{
//     const Audio = await Audio.findById(req.params.id)

//     // if Audio Doesn't Exist
//     if (!Audio){
//         res.status(404)
//         throw new Error("Audio not found");
//     }

//     // Match Audio to it user
//     if (Audio.user.toString() != req.user.id){
//         res.status(401)
//          throw new Error("User Not authorized ")
//     }
//     await Audio.remove()
//     res.status(200).json({message: "Audio Deleted"});
//  })

// //Update Audio
// const updateAudio = asyncHandler (async (req, res) =>{
//     const {name, category, quantity, price, description} = req.body;
//     const {id}=  req.params

//     const Audio = await Audio.findById(id)

//     // if Audio doesn't exist
//     if (!Audio){
//         res.status(404)
//         throw new Error("Audio not found");
//     }

//     // Match Audio to it user
// if (Audio.user.toString() != req.user.id){
//     res.status(401)
//      throw new Error("User Not authorized ")
// }

//Handle  Audio uploads
// let fileData = {}
// if(req.file){
//     // Save Audio to Cloudinary
//     let uploadedFile;
//         try {
//             uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder: name, resource_type: "mp3"})
//         } catch (error){
//             res.status(500)
//             throw new Error ("Audio could not be uploaded")
//         }
//     fileData = {
//         fileName: req.file.originalname,
//         filePath: uploadedFile.secure_url,
//         filetype: req.file.mimetype,
//         fileSize: fileSizeFormatter(req.file.size, 2),

//     }
// }

//     //update Audio

//     const updatedAudio = await Audio.findByIdAndUpdate({_id: id},
//          { name,
//         category,
//         quantity,
//         price,
//          description,
//         image : Object.keys(fileData).length === 0 ?  Audio?.image : fileData,
//         },
//         {
//             new: true,
//             runValidators: true
//         });

        
    //     res.status(200).json(updatedAudio)
    
    // })
    

    
module.exports = {
    createAudio,
    // getAudios,
    // getAudio,
    // deleteAudio,
    // updateAudio,
    testAudio,

}