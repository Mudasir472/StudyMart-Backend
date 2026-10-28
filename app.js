const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { connectdb } = require("./config/MongoDB")
require('dotenv').config();
const OpenAI = require("openai");

dns.setServers(['8.8.8.8', '8.8.4.4']);


// Mongo connection
connectdb(process.env.MONGO_URI_LOCAL);

// Middleware setup
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests without an Origin header, such as some server-side requests
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
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
const chatRoutes = require("./routes/chat.routes");

// Routes used
app.use("/api/ai", chatRoutes);
app.use("/", userRouter)
app.use("/", courceRouter)
app.use("/", reviewRouter)
app.use("/api/material", studyMaterialRouter)
app.use("/", instructorRouter)


const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('server is running on port ' + port);
});