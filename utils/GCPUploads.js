const fs = require("fs").promises;
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { respondsSender } = require("../middleWare/respondsHandler");
const { ResponseCode } = require("./responseCode");
const dotenv = require("dotenv").config();

ffmpeg.setFfmpegPath(ffmpegPath);

const projectId = process.env.PROJECT_ID;
const keyFilename = "./service.json"; //process.env.KEYFILENAME;
const bucketName = process.env.BUCKET_NAME;

const storage = new Storage({
  projectId,
  keyFilename,
});

async function uploadFile(
  bucketName,
  file,
  fileOutputName,
  folderName,
  language
) {
  try {
    const bucket = storage.bucket(bucketName);
    const subFolder = language || "English";
    const destination = folderName
      ? `${process.env.ENVIRONMENT}/${folderName}/${subFolder}/${fileOutputName}`
      : fileOutputName;
    `${folderName}`;
    // Check if the folder exists
    const GCPFilePath = `${process.env.ENVIRONMENT}/${folderName}/${subFolder}/`;
    const [exists] = await bucket.file(folderName).exists();
    if (!exists) {
      // If the folder doesn't exist, create it
      await bucket.file(folderName).save("", { resumable: false });
    }

    const retValue = await bucket.upload(file, {
      destination,
    });

    const uploadedFileRes = { retValue, GCPFilePath };
    return uploadedFileRes;
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
}

const fileNameGenerator = () => {
  // Get current date and time
  const currentTime = new Date();

  // Format the date and time
  const formattedTime = `${currentTime.getFullYear()}-${(
    currentTime.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${currentTime
    .getDate()
    .toString()
    .padStart(2, "0")}_${currentTime
    .getHours()
    .toString()
    .padStart(2, "0")}-${currentTime
    .getMinutes()
    .toString()
    .padStart(2, "0")}-${currentTime.getSeconds().toString().padStart(2, "0")}`;

  return `awarrilangeasecaptured_${formattedTime}`;
};

const uploadToGCS = async (req, res, next) => {
  const fileName = `${fileNameGenerator()}_${req.file.originalname}`;
  const tempFilePath = path.join(__dirname, "../temp", fileName);
  const tempConvertedFilePath = path.join(
    __dirname,
    "../temp",
    `${fileName}.wav`
  );

  const { task, language } = req.body;
  if (!task) {
    respondsSender(
      null,
      "please indicate task(record or speak) as part of your request",
      ResponseCode.badRequest,
      res
    );
  }
  //get the folder to save file
  const folderName = task;
  try {
    // Write the buffer to a temporary file
    await fs.writeFile(tempFilePath, req.file.buffer);

    // Convert the temporary file from webm to wav
    await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .toFormat("wav")
        .on("end", resolve)
        .on("error", reject)
        .save(tempConvertedFilePath);
    });

    // Upload the converted file
    const uploadedFileRes = await uploadFile(
      bucketName,
      tempConvertedFilePath,
      `${fileName}.wav`,
      folderName,
      language
    );

    const retValue = uploadedFileRes.retValue;
    const GCPFilePath = uploadedFileRes.GCPFilePath;

    req.uploadedFileName = retValue; // Attach filename to request object
    req.fileName = fileName; // Attach filename to request object
    req.filePath = GCPFilePath;

    // Delete the temporary files after upload
    await fs.unlink(tempFilePath);
    await fs.unlink(tempConvertedFilePath);

    next();
  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
};

module.exports = { uploadToGCS };
