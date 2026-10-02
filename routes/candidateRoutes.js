const express = require("express");

const {
  createCandidate,
  getCandidates,
  updateCandidateStatus,
  getCandidateCertificateStatus,
} = require("../controllers/candidateController");

const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

// Candidate
router.post("/", createCandidate);

// Candidate certificate status - public
router.get("/status", getCandidateCertificateStatus);

// Admin - protected
router.get("/", protectAdmin, getCandidates);

router.patch(
  "/:id/status",
  protectAdmin,
  updateCandidateStatus
);

module.exports = router;