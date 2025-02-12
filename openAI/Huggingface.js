
const axios = require('axios')
const dotenv = require('dotenv')
const express = require('express');
const authenticate = require('../middlewares/authenticate');
dotenv.config();
const router = express.Router();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

router.post("/chat", authenticate, async (req, res) => {
    try {
        const { message } = req.body;
        console.log(message);

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const response = await axios.post('https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
            inputs: message,
        }, {
            headers: {
                'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        console.log(response);

        const data = response.data;
        if (data.error) {
            console.log(data.error);

            return res.status(400).json({ error: data.error });
        }

        const reply = data[0]?.generated_text || "No response from AI";
        res.json({ reply });
    } catch (error) {
        // console.error("Chatbot error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
