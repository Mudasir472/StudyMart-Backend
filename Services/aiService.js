const axios = require("axios");

const askTutor = async (question) => {

    const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            model: "meta-llama/llama-3-8b-instruct",
            messages: [
                {
                    role: "system",
                    content: `
You are StudyMart AI Tutor.

Rules:
1. Only answer study related questions (school, college, programming, science, maths, history etc).
2. If the question is not related to studies, politely refuse.
3. Reply like this when refusing:
"I am StudyMart AI Tutor and I only answer study related questions."
4. Explain answers simply so students can understand.
`
                },
                {
                    role: "user",
                    content: question
                }
            ]
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data.choices[0].message.content;
};

module.exports = askTutor;