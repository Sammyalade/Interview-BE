const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const audioRoute = require("./routes/audioRoute");
const dialogueRoute = require("./routes/dialogueRoute");
const wordBankRoute = require("./routes/wordBankRoute");
const contactRoute = require("./routes/contactRoute");
const metadataRoute = require("./routes/metadataRoute");
const adminRoute = require("./routes/adminRoute")
// const adminRoute = require("./routes/adminRoute");

const feedbackRoute = require("./routes/feedbackRoute");
const taskRoute = require("./routes/taskRoute");
const errorHandler = require("./middleWare/errorMiddleware");
const cookieParser = require("cookie-parser");
const path = require("path");

const multer = require("multer");

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

mongoose.set("strictQuery", true);

const app = express();
// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Route Middleware
app.use("/api/users", userRoute);
app.use("/api/audio", audioRoute);
app.use("/api/word", wordBankRoute);
app.use("/api/contactus", contactRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/dialogue", dialogueRoute);
app.use("/api/metadataGenerator", metadataRoute);
app.use("/api/task", taskRoute);
app.use("/api/admin", adminRoute)
// app.use("/api/admin", adminRoute);


// Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});

// Error Middleware
app.use(errorHandler);

// Start Server - okiki's code
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server running on Port ${PORT}`);
// });

// MongoDB connection code is commented out
/*
mongoose.set('debug', true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('DB connected successfully');
  })
  .catch((error) => {
    console.log(error);
  });
*/

//Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});
//Error MiddleWare
app.use(errorHandler);
//connect to DB and start Server
const PORT = process.env.PORT || 4000;
// mongoose.set('debug', true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on Port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
