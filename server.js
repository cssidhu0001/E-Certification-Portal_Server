const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const healthRoutes = require("./routes/healthRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reportRoutes = require("./routes/reportRoutes");
const proceedingsRoutes = require("./routes/proceedingsRoutes");
const connectDB = require("./config/db");

const app = express();

connectDB();


// ===============================
// CORS
// ===============================

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,

    exposedHeaders: [
      "X-Export-Password",
      "X-Export-Filename",
    ],
  })
);


// ===============================
// BODY PARSER
// ===============================

app.use(express.json());


// ===============================
// BASIC ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send("Conference Certificate API Running");
});


// ===============================
// ALL ROUTES
// ===============================

app.use("/api/health", healthRoutes);

app.use(
  "/certificates",
  express.static(path.join(__dirname, "certificates"))
);

app.use("/api/candidates", candidateRoutes);

app.use("/api/verify", verificationRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/proceedings", proceedingsRoutes);


// ===============================
// HTTP SERVER
// ===============================

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);


// ===============================
// SOCKET.IO
// ===============================

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});


// Make Socket.IO available
// inside Express controllers
app.locals.io = io;


// ===============================
// SOCKET CONNECTION
// ===============================

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});


// ===============================
// START SERVER
// ===============================

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Socket.IO enabled");
});