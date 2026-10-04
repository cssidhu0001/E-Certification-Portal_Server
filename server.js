const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const healthRoutes = require("./routes/healthRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reportRoutes = require("./routes/reportRoutes");
const connectDB = require("./config/db");


const app = express();

connectDB();

app.use(cors({
    origin: process.env.FRONTEND_URL,
       credentials: true,
    exposedHeaders: [
      "X-Export-Password",
      "X-Export-Filename",
    ],
  }));
app.use(express.json());


// All Routes
app.get("/", (req, res) => {
  res.send("Conference Certificate API Running");
});
app.use("/api/health", healthRoutes);
app.use(
  "/certificates",
  express.static(path.join(__dirname, "certificates"))
);
app.use("/api/candidates", candidateRoutes);
app.use("/api/verify", verificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

