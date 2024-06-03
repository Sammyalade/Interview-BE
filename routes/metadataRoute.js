const express = require("express");
const router = express.Router();
const {
  getSpokenOratory,
  getRecordedOratory,
  getSpokenDialogue,
  getRecordedDialogue,
  getallMetadata,
  getTranslatedText,
  test,
} = require("../controllers/MetadataController");

router.get("/recordeddialogue", getRecordedDialogue);
router.get("/spokendialogue", getSpokenDialogue);
router.get("/recordedoratory/", getRecordedOratory);
router.get("/spokenoratory/", getSpokenOratory);
router.get("/translate", getTranslatedText);
router.get("/allmetadata", getallMetadata);
router.get("/test", test);

module.exports = router;
