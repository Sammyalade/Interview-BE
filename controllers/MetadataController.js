const asyncHandler = require("express-async-handler");
const { respondsSender } = require("../middleWare/respondsHandler");
const { ResponseCode } = require("../utils/responseCode");
const Dialogue = require("../models/dialogueModel");
const subDialogue = require("../models/subDialogueModel");
const Translate = require("../models/translateModel");
const Speak = require("../models/speakModel");
const Record = require("../models/recordModel");
const UserTask = require("../models/userTaskModel");
const Oratory = require("../models/oratoryModel");
const { Parser } = require("json2csv");

const DAstatus = require("../models/dAssignmentStatus");

const User = require("../models/userModel");
const { calculateAge } = require("../utils/convertDOB");

const test = asyncHandler(async (req, res) => {
  respondsSender(
    null,
    "Hello Metadata Route and controller is working",
    ResponseCode.successful,
    res
  );
});

const getSpokenOratory = asyncHandler(async (req, res) => {
  //select all
  respondsSender(null, "Display Dialog csv", ResponseCode.successful, res);
});

const getRecordedOratory = asyncHandler(async (req, res) => {
  respondsSender(null, "Display Oratory csv", ResponseCode.successful, res);
});

const getSpokenDialogue = asyncHandler(async (req, res) => {
  try {
    const records = await Speak.find();

    const processedRecords = await processRecords(records);
    // console.log("processed Record for speak >>>>>", processedRecords);

    const reducedProcessedData = arrayReducer(processedRecords);

    //convert reponse to csv
    const csv = await csvWriter(reducedProcessedData);

    res.header("Content-Type", "text/csv");
    res.attachment(
      `${Math.floor(Math.random() * 10000000)}_speak_metadata.csv`
    );
    return res.send(csv);
  } catch (error) {
    console.error("Error processing records:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing records",
      error: error.message,
    });
  }
});

const getTranslatedText = asyncHandler(async (req, res) => {
  try {
    const records = await Translate.find();

    const processedRecords = await processRecords(records);
    // console.log("processed Record for Translate >>>>>", processedRecords);

    const reducedProcessedData = arrayReducer(processedRecords);

    //convert reponse to csv
    const csv = await csvWriter(reducedProcessedData);

    res.header("Content-Type", "text/csv");
    res.attachment(
      `${Math.floor(Math.random() * 10000000)}_translate_metadata.csv`
    );
    return res.send(csv);
  } catch (error) {
    console.error("Error processing records:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing records",
      error: error.message,
    });
  }
});

const processRecords = async (records, isSpeak = false) => {
  const processedRecords = await Promise.all(
    records.map(async (record) => {
      console.log("Records >>>", records);
      const {
        oratoryId,
        subDialogueId,
        dialogueId,
        userId,
        filePath,
        language,
      } = record;

      const fetchOratoryPromise = oratoryId
        ? fetchOratory(oratoryId)
        : Promise.resolve(null);
      const fetchUserTaskStatusPromise = userId
        ? fetchAssignUser(userId)
        : Promise.resolve(null);
      const fetchUserPromise = userId
        ? fetchUser(userId)
        : Promise.resolve(null);
      const fetchSubDialoguePromise = subDialogueId
        ? fetchSubDialogue(subDialogueId)
        : Promise.resolve(null);
      const fetchDialoguePromise = dialogueId
        ? fetchDialogue(dialogueId)
        : Promise.resolve(null);

      // Fetch the translated text if the record is for Speak
      let translateText = null;
      if (isSpeak && filePath && filePath.includes("Speak")) {
        const translateRecord = await Translate.findOne({
          dialogueId,
          subDialogueId,
          language,
        });
        if (translateRecord) {
          translateText = translateRecord.translateText;
        }
      }

      const [oratory, subDialogue, dialogue, userTask, user] =
        await Promise.all([
          fetchOratoryPromise,
          fetchSubDialoguePromise,
          fetchDialoguePromise,
          fetchUserTaskStatusPromise,
          fetchUserPromise,
        ]);
      return {
        ...record,
        oratory,
        subDialogue,
        dialogue,
        user,
        translateText,
      };
    })
  );

  return processedRecords;
};

// Replace these with your actual fetching logic
const fetchOratory = async (oratoryId) => {
  // Fetch oratory by oratoryId
  const fetchedOratory = await Oratory.findById({ _id: oratoryId });
  return fetchedOratory; // return all fectched data
};

const fetchAssignUser = async (userId) => {
  // Fetch subDialogue by oratoryId
  const fetchAssignedUser = await UserTask.findOne({ userId: userId });

  return fetchAssignedUser; // return all fectched data
};

const fetchUser = async (userId) => {
  // Fetch subDialogue by oratoryId
  const fetchedUser = await User.findById({ _id: userId });
  return fetchedUser; // return all fectched data
};

const fetchSubDialogue = async (subDialogueId) => {
  // Fetch subDialogue by oratoryId
  const fetchedSubDialogue = await subDialogue.findById({ _id: subDialogueId });

  return fetchedSubDialogue; // return all fectched data
};

const fetchDialogue = async (dialogueId) => {
  // Fetch subDialogue by oratoryId
  const fetchedDialogue = await Dialogue.findById({ _id: dialogueId });
  return fetchedDialogue; // return all fectched data
};

const arrayReducer = (data) => {
  const reducedData = data.map((item) => {
    // console.log("item doc >>", item._doc);
    console.log("item  >>", item);

    const {
      _id,
      filePath, //destructure filepath if it exist in item doc.
      // fileLink,
      fileName,
      dialogueId,
      subDialogueId,
      oratoryId,
      userId,
      language,
      translateText,
    } = item._doc;
    // console.log("item Doc >>>>", item._doc);

    const text = item.subDialogue
      ? item.subDialogue.text
      : item.oratory
      ? item.oratory.text
      : null;
    const identifier = item.subDialogue ? item.subDialogue.identifier : null;
    const DialogueTitle = item.dialogue ? item.dialogue.title : null;
    const domain = item.dialogue ? item.dialogue.domain : null;
    const scenario = item.dialogue ? item.dialogue.scenario : null;
    const translateTextHere = item._doc;

    const newFilePath = filePath ? `${filePath}${fileName}` : "";

    const {
      firstname,
      lastname,
      email,
      gender,
      dateOfBirth,
      accent,
      // language,
    } = item.user;

    const convertedDOB = calculateAge(dateOfBirth); //Convert the date of birth to user's age

    return {
      fileId: _id,
      filePath: newFilePath,
      // fileLink,
      fileName: fileName || "",
      dialogueId,
      subDialogueId,
      oratoryId,
      userId,
      text,
      audioLanguage: language,
      translatedText: item.translateText,
      identifier,
      DialogueTitle,
      domain,
      scenario,
      userFirstname: firstname,
      userLastname: lastname,
      userEmail: email,
      userGender: gender,
      userAge: convertedDOB,
      userAccent: accent,
    };
  });
  return reducedData;
};

const csvWriter = async (data) => {
  const fields = [
    "fileId",
    "filePath",
    // "fileLink",
    "fileName",
    "dialogueId",
    "subDialogueId",
    "oratoryId",
    "userId",
    "text",
    "audioLanguage",
    "translatedText",
    "identifier",
    "DialogueTitle",
    "domain",
    "scenario",
    "userFirstname",
    "userLastname",
    "userEmail",
    "userGender",
    "userAge",
    "userAccent",
  ];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(data);
  return csv;
};

const getRecordedDialogue = asyncHandler(async (req, res) => {
  try {
    const records = await Record.find();

    const processedRecords = await processRecords(records);
    // console.log("Processed Records >>>>", processedRecords);

    const reducedProcessedData = arrayReducer(processedRecords);
    //convert reponse to csv
    const csv = await csvWriter(reducedProcessedData);

    res.header("Content-Type", "text/csv");
    res.attachment(
      `${Math.floor(Math.random() * 10000000)}_record_metadata.csv`
    );
    return res.send(csv);
  } catch (error) {
    console.error("Error processing records:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing records",
      error: error.message,
    });
  }
});

const getallMetadata = asyncHandler(async (req, res) => {
  try {
    // const translateRecords = await Translate.find();
    const speakRecords = await Speak.find();
    const recordRecords = await Record.find();

    // const processedTranslateRecords = await processRecords(translateRecords);
    const processedSpeakRecords = await processRecords(speakRecords, true);
    const processedRecordRecords = await processRecords(recordRecords);

    // Combine all records into one array
    const combinedRecords = [
      // ...processedTranslateRecords,
      ...processedSpeakRecords,
      ...processedRecordRecords,
    ];
    // console.log("all records>>>>>", combinedRecords);

    const reducedProcessedData = arrayReducer(combinedRecords);

    //convert reponse to csv
    const csv = await csvWriter(reducedProcessedData);

    res.header("Content-Type", "text/csv");
    res.attachment(`${Math.floor(Math.random() * 10000000)}_all_metadata.csv`);
    return res.send(csv);
  } catch (error) {
    console.error("Error processing records:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing records",
      error: error.message,
    });
  }
});

module.exports = {
  getSpokenOratory,
  getRecordedOratory,
  getSpokenDialogue,
  getRecordedDialogue,
  getallMetadata,
  getTranslatedText,
  test,
};
