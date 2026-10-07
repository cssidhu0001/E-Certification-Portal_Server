const express = require("express");

const {
  getReportConfig,
  previewReport,
  exportReport,
} = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/config", getReportConfig);

router.post("/preview", previewReport);

router.post("/export", exportReport);

module.exports = router;