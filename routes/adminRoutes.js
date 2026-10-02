const express = require("express");

const {
  adminRegister,
  adminLogin,
} = require("../controllers/adminController");

const router = express.Router();

router.post("/register", adminRegister);
router.post("/login", adminLogin);

module.exports = router;