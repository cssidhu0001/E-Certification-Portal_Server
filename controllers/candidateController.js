const Candidate = require("../models/Candidate");
const generateCertificate = require("../utils/generateCertificate");
const { formatTitleCase } = require("../utils/formatText");
const certificateQueue = require("../utils/certificateQueue");

// ======================================================
// CREATE CANDIDATE
// ======================================================

const createCandidate = async (req, res) => {
  try {
    const { email, name, certificateType, presentationTitle } = req.body;

    // Basic email validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Format name
    const formattedName = formatTitleCase(name);

    // Format presentation title
    const formattedPresentationTitle = formatTitleCase(
      presentationTitle || ""
    );

    // Check duplicate email
    const existingCandidate = await Candidate.findOne({
      email: normalizedEmail,
    });

    if (existingCandidate) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    // Create candidate
    const candidate = await Candidate.create({
      ...req.body,
      name: formattedName,
      email: normalizedEmail,

      presentationTitle:
        certificateType === "Research Paper" ||
        certificateType === "Poster"
          ? formattedPresentationTitle
          : "",

      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Registration submitted successfully",
      candidate,
    });
  } catch (error) {
    console.error("Create Candidate Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET ALL CANDIDATES
// ======================================================

const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      candidates,
    });
  } catch (error) {
    console.error("Get Candidates Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE CANDIDATE STATUS
// APPROVE / REJECT
// ======================================================

const updateCandidateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const candidateId = req.params.id;

    console.log("--------------------------------------");
    console.log("Candidate Status Update");
    console.log("Candidate ID:", candidateId);
    console.log("Requested Status:", status);
    console.log("--------------------------------------");

    // --------------------------------------------------
    // Validate status
    // --------------------------------------------------

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use Approved or Rejected.",
      });
    }

    // --------------------------------------------------
    // Find candidate
    // --------------------------------------------------

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found.",
      });
    }

    console.log("Candidate found:", candidate.name);
    console.log("Candidate email:", candidate.email);
    console.log("Current status:", candidate.status);

    // ==================================================
    // APPROVE CANDIDATE
    // ==================================================

    if (status === "Approved") {
      // ------------------------------------------------
      // If already approved and certificate exists
      // don't generate another certificate
      // ------------------------------------------------

      if (
        candidate.status === "Approved" &&
        candidate.certificateId &&
        candidate.certificateUrl
      ) {
        console.log(
          "Candidate already approved. Existing certificate will be returned."
        );

        return res.json({
          success: true,
          message: "Candidate is already approved.",
          candidate,
        });
      }

      // ------------------------------------------------
      // Generate Certificate ID
      // ------------------------------------------------

      const certificateId =
        "CONF-IANETL-2026-" +
        Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

      console.log(
        "Certificate ID generated:",
        certificateId
      );

      // ------------------------------------------------
      // Generate Certificate PDF
      // Through certificate queue
      // ------------------------------------------------

      console.log(
        "Starting certificate generation..."
      );

      let certificateUrl;

      try {
        certificateUrl = await certificateQueue.add(() =>
          generateCertificate(candidate, certificateId)
        );
      } catch (certificateError) {
        console.error(
          "Certificate generation failed:"
        );

        console.error(certificateError);

        return res.status(500).json({
          success: false,
          message:
            "Candidate approval failed because certificate generation failed.",
          error: certificateError.message,
        });
      }

      // ------------------------------------------------
      // Certificate generated successfully
      // ------------------------------------------------

      console.log(
        "Certificate generated successfully:"
      );

      console.log(certificateUrl);

      // ------------------------------------------------
      // Validate returned Cloudinary URL
      // ------------------------------------------------

      if (!certificateUrl) {
        console.error(
          "Certificate URL was not returned by generateCertificate."
        );

        return res.status(500).json({
          success: false,
          message:
            "Certificate was generated but certificate URL was not returned.",
        });
      }

      // ------------------------------------------------
      // Update candidate
      // Only after successful certificate generation
      // ------------------------------------------------

      candidate.status = "Approved";

      candidate.certificateId = certificateId;

      candidate.certificateUrl = certificateUrl;

      candidate.approvedAt = new Date();

      // ------------------------------------------------
      // Save candidate
      // ------------------------------------------------

      await candidate.save();

      console.log(
        "Certificate URL saved to MongoDB:",
        candidate.certificateUrl
      );

      console.log(
        "Candidate approved successfully."
      );

      // ------------------------------------------------
      // Response
      // ------------------------------------------------

      return res.json({
        success: true,

        message:
          "Candidate approved and certificate generated successfully.",

        candidate,
      });
    }

    // ==================================================
    // REJECT CANDIDATE
    // ==================================================

    if (status === "Rejected") {
      candidate.status = "Rejected";

      // Remove approval/certificate information
      candidate.certificateId = undefined;
      candidate.certificateUrl = undefined;
      candidate.approvedAt = undefined;

      await candidate.save();

      console.log(
        "Candidate rejected successfully."
      );

      return res.json({
        success: true,

        message: "Candidate rejected successfully.",

        candidate,
      });
    }
  } catch (error) {
    console.error(
      "Update Candidate Status Error:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        "Failed to update candidate status.",

      error: error.message,
    });
  }
};

// ======================================================
// GET CANDIDATE CERTIFICATE STATUS
// ======================================================

const getCandidateCertificateStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const candidate = await Candidate.findOne({
      email: email.toLowerCase().trim(),
    }).select(
      "name email status certificateId certificateUrl approvedAt"
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message:
          "No registration found with this email",
      });
    }

    return res.status(200).json({
      success: true,

      candidate: {
        name: candidate.name,
        email: candidate.email,
        status: candidate.status,
        certificateId:
          candidate.certificateId || null,
        certificateUrl:
          candidate.certificateUrl || null,
        approvedAt:
          candidate.approvedAt || null,
      },
    });
  } catch (error) {
    console.error(
      "Certificate status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch certificate status",
    });
  }
};

// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
  createCandidate,
  getCandidates,
  updateCandidateStatus,
  getCandidateCertificateStatus,
};