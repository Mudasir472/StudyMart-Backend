const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { connectdb } = require("./config/MongoDB")
require('dotenv').config();

// Middleware setup
app.use(cors({
    origin: ["https://study-mart-a-learning-management-system.vercel.app", "http://localhost:5173","*"], // React frontend URL
    credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.get('/', (req, res) => {
    res.send("I am listening at 5000");
})
// Routes defined
const userRouter = require("./routes/user.router");
const courceRouter = require("./routes/cource.router")
const reviewRouter = require("./routes/review.router")
const instructorRouter = require("./routes/instructor.router")
const studyMaterialRouter = require("./routes/studyMaterial.routes.js");

// Mongo connection
connectdb(process.env.MONGO_URI);

// Routes used
app.use("/", userRouter)
app.use("/", courceRouter)
app.use("/", reviewRouter)
app.use("/", instructorRouter)
app.use("/api/material", studyMaterialRouter)


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('server is running on port 5000');
});