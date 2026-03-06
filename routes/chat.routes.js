const express = require("express");
const askTutor = require("../Services/aiService");
// const askTutor = require("../services/aiService");

const router = express.Router();

router.post("/ask", async (req, res) => {

    try {

        const { question } = req.body;


        const answer = await askTutor(question);

        res.json({
            success: true,
            answer
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "AI failed"
        });
    }

});

module.exports = router;