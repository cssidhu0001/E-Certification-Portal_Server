const Candidate = require("../models/Candidate");

// ==========================================
// QR VERIFICATION
// GET /api/verify/:certificateId
// ==========================================
const verifyCertificateByQR = async (req, res) => {
  console.log("================================");
  console.log("QR VERIFY API HIT");
  console.log("Certificate ID:", req.params.certificateId);
  console.log("================================");

  try {
    const { certificateId } = req.params;

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Certificate ID is required",
      });
    }

    const candidate = await Candidate.findOne({
      certificateId: certificateId.trim(),
      status: "Approved",
    }).select("-__v");

    console.log("Candidate found:", candidate);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Invalid or unverified certificate",
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: "Certificate verified successfully",
      candidate,
    });
  } catch (error) {
    console.error("QR VERIFY ERROR:", error);

    return res.status(500).json({
      success: false,
      valid: false,
      message: "Unable to verify certificate",
    });
  }
};


// ==========================================
// MANUAL VERIFICATION
// GET /api/verify?email=...&certificateId=...
// ==========================================
const verifyCertificateManually = async (req, res) => {
  console.log("================================");
  console.log("MANUAL VERIFY API HIT");
  console.log("Email:", req.query.email);
  console.log("Certificate ID:", req.query.certificateId);
  console.log("================================");

  try {
    const { email, certificateId } = req.query;

    if (!email || !certificateId) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Email and Certificate ID are required",
      });
    }

    const candidate = await Candidate.findOne({
      email: email.trim().toLowerCase(),
      certificateId: certificateId.trim(),
      status: "Approved",
    }).select("-__v");

    console.log("Candidate found:", candidate);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Email and Certificate ID do not match",
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: "Certificate verified successfully",
      candidate,
    });
  } catch (error) {
    console.error("MANUAL VERIFY ERROR:", error);

    return res.status(500).json({
      success: false,
      valid: false,
      message: "Unable to verify certificate",
    });
  }
};


module.exports = {
  verifyCertificateByQR,
  verifyCertificateManually,
};