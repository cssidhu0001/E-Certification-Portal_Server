const jwt = require("jsonwebtoken");

const protectAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log(
      "Authenticated Admin:",
      decoded
    );

    req.admin = decoded;

    next();
  } catch (error) {
    console.error(
      "Admin auth error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};

module.exports = protectAdmin;