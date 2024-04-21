const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

const projectId = process.env.PROJECT_ID || 'development-416403';
const keyFilename = process.env.KEYFILENAME || './../service.json';
const bucketName = process.env.BUCKET_NAME || 'front-end-audio-storage-awarri';


const storage = new Storage({
    projectId,
    keyFilename
});

async function uploadFile(bucketName, file, fileOutputName) {
    try {
        const bucket = storage.bucket(bucketName);
        const retValue = await bucket.upload(file, {
            destination: fileOutputName
        });
        return retValue;
    } catch (error) {
        console.log("Error:", error);
        throw error; // Rethrow the error to be caught by the caller
    }
}

const fileNameGenerator =()=>{

// Get current date and time
const currentTime = new Date();

// Format the date and time
const formattedTime = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')}_${currentTime.getHours().toString().padStart(2, '0')}-${currentTime.getMinutes().toString().padStart(2, '0')}-${currentTime.getSeconds().toString().padStart(2, '0')}`;

return `awarrilangeasecaptured_${formattedTime}.txt`;

}

const uploadToGCS = async (req, res, next) => {


  const fileName= fileNameGenerator()

    try {
        const retFile = await uploadFile(bucketName, 'text.txt', `${fileName}`);
      
        req.uploadedFileName = retFile; // Attach filename to request object
        next();
    } catch (error) {
        console.error("Error:", error);
        next(error);
    }
};

module.exports = { uploadToGCS };
