const express = require("express");

const {
  verifyCertificateByQR,
  verifyCertificateManually,
} = require("../controllers/verificationController");

const router = express.Router();

router.get("/", verifyCertificateManually);



router.get("/:certificateId", verifyCertificateByQR);


module.exports = router;    