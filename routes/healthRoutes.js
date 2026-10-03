const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "IANETL backend is healthy",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;