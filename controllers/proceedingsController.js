const Proceedings = require("../models/Proceedings");

const getProceedings = async (req, res) => {
  try {
    let proceedings = await Proceedings.findOne({
      key: "abstract-proceedings",
    });

    if (!proceedings) {
      proceedings = await Proceedings.create({
        key: "abstract-proceedings",

        // CHANGE THIS TIME IF REQUIRED
        launchDate: new Date("2026-10-09T10:00:00+05:30"),

        launched: false,

        heyzineUrl: process.env.HEYZINE_PROCEEDINGS_URL || "",
      });
    }

    return res.json({
      success: true,
      proceedings,
    });
  } catch (error) {
    console.error("Get Proceedings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch proceedings.",
    });
  }
};


const launchProceedings = async (req, res) => {
  try {
    let proceedings = await Proceedings.findOne({
      key: "abstract-proceedings",
    });

    if (!proceedings) {
      proceedings = await Proceedings.create({
        key: "abstract-proceedings",
        launchDate: new Date("2026-10-09T10:00:00+05:30"),
        heyzineUrl: process.env.HEYZINE_PROCEEDINGS_URL || "",
      });
    }

    if (proceedings.launched) {
      return res.status(400).json({
        success: false,
        message: "Abstract Proceedings are already launched.",
        proceedings,
      });
    }

    proceedings.launched = true;
    proceedings.launchedAt = new Date();

    await proceedings.save();

    // Send live launch event to connected users
    if (req.app.locals.io) {
      req.app.locals.io.emit("proceedings:launch", {
        launched: true,
        launchedAt: proceedings.launchedAt,
        heyzineUrl: proceedings.heyzineUrl,
      });
    }

    return res.json({
      success: true,
      message: "Abstract Proceedings launched successfully.",
      proceedings,
    });
  } catch (error) {
    console.error("Launch Proceedings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to launch proceedings.",
    });
  }
};


module.exports = {
  getProceedings,
  launchProceedings,
};