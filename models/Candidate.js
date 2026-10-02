const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    institution: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    participationType: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },

    certificateType: {
      type: String,
      enum: [
        "Organizer",
        "Resource Person",
        "Delegate",
        "Research Paper",
        "Poster",
      ],
      required: true,
      default: "Delegate",
    },

    // Required only for Research Paper / Poster
    presentationTitle: {
      type: String,
      trim: true,
      default: "",
    },

    eventName: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    approvedAt: {
      type: Date,
    },

    certificateId: {
      type: String,
      unique: true,
      sparse: true,
    },

    certificateUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Candidate", candidateSchema);