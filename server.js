const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const audioRoute = require("./routes/audioRoute");
const wordBankRoute = require("./routes/wordBankRoute");
const contactRoute = require("./routes/contactRoute");
const errorHandler = require("./middleWare/errorMiddleware");
const cookieParser = require("cookie-parser");
const path = require("path");

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

//Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});
//Error MiddleWare
app.use(errorHandler);
//connect to DB and start Server
const PORT = process.env.PORT || 4000;
mongoose.set('debug', true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('DB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on Port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
