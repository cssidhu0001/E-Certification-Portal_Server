const express = require("express");

const {
  getProceedings,
  launchProceedings,
} = require("../controllers/proceedingsController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getProceedings);

// Admin only
router.post("/launch", authMiddleware, launchProceedings);

module.exports = router;