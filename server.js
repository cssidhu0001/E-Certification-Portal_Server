const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const candidateRoutes = require("./routes/candidateRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const connectDB = require("./config/db");


const app = express();

connectDB();

app.use(cors({
    origin: process.env.FRONTEND_URL,
  }));
app.use(express.json());


// All Routes
app.get("/", (req, res) => {
  res.send("Conference Certificate API Running");
});
app.use(
  "/certificates",
  express.static(path.join(__dirname, "certificates"))
);
app.use("/api/candidates", candidateRoutes);
app.use("/api/verify", verificationRoutes);
app.use("/api/admin", adminRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

