const mongoose = require("mongoose");

const proceedingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "abstract-proceedings",
    },

    launched: {
      type: Boolean,
      default: false,
    },

    launchedAt: {
      type: Date,
      default: null,
    },

    launchDate: {
      type: Date,
      required: true,
    },

    heyzineUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Proceedings", proceedingsSchema);