
const axios = require("axios");

const askTutor = async (question) => {
    try {


        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "meta-llama/llama-3.1-8b-instruct",
                messages: [
                    {
                        role: "system",
                        content: `You are StudyMart AI Tutor.
Only answer study-related questions.
Explain answers simply for students.`
                    },
                    {
                        role: "user",
                        content: question
                    }
                ]
            },
            {
                timeout: 30000,
                headers: {
                    Authorization:
                        `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content;

    } catch (error) {
        console.error(
            "OpenRouter error:",
            error.response?.status,
            error.response?.data || error.message
        );

        throw error;
    }
};

module.exports = askTutor;
