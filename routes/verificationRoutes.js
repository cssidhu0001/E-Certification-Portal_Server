const express = require("express");

const {
  verifyCertificateByQR,
  verifyCertificateManually,
} = require("../controllers/verificationController");

const router = express.Router();

// ==========================================
// MANUAL VERIFICATION
// GET /api/verify?email=...&certificateId=...
// ==========================================
router.get("/", verifyCertificateManually);


// ==========================================
// QR VERIFICATION
// GET /api/verify/:certificateId
// ==========================================
router.get("/:certificateId", verifyCertificateByQR);


module.exports = router;