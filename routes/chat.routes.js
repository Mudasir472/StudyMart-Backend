const express = require("express");
const askTutor = require("../Services/aiService");
// const ChatCollection = require("../models/Chat");

const authenticate = require("../middlewares/authenticate");
const ChatCollection = require("../modals/chat.model");
const optionalAuth = require("../middlewares/optionalAuth");

const router = express.Router();

// router.post("/ask", authenticate, async (req, res) => {
//     try {

//         const { question } = req.body;
//         const userId = req.user?.id; // from auth middleware

//         if (!question || !userId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Question and userId are required"
//             });
//         }
//         const answer = await askTutor(question);


//         // Find existing chat of user
//         let chat = await ChatCollection.findOne({ userId });

//         if (!chat) {
//             chat = new ChatCollection({
//                 userId,
//                 messages: []
//             });
//         }

//         // Save user question
//         chat.messages.push({
//             sender: "user",
//             text: question
//         });

//         // Save AI answer
//         chat.messages.push({
//             sender: "ai",
//             text: answer
//         });

//         await chat.save();

//         res.json({
//             success: true,
//             answer
//         });

//     } catch (error) {
//         console.log(error);

//         res.status(500).json({
//             success: false,
//             message: "AI failed"
//         });

//     }
// });

router.post("/ask", optionalAuth, async (req, res) => {
    try {

        const { question, chatId } = req.body;
        const userId = req.user?.id;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Question is required"
            });
        }

        const answer = await askTutor(question);

        //  GUEST USER → no DB
        if (!userId) {
            return res.json({
                success: true,
                answer
            });
        }
        let chat;

        // ✅ If chatId exists → continue that chat
        if (chatId) {
            chat = await ChatCollection.findById(chatId);
        }

        // ✅ If no chat → create new one
        if (!chat) {
            chat = new ChatCollection({
                userId,
                title: question.substring(0, 30), // sidebar title
                messages: []
            });
        }

        // Save user message
        chat.messages.push({
            sender: "user",
            text: question
        });

        // Save AI response
        chat.messages.push({
            sender: "ai",
            text: answer
        });

        await chat.save();

        res.json({
            success: true,
            answer,
            chatId: chat._id,
            messages: chat.messages,
            title: chat.title
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            success: false,
            message: error.message || "AI failed"
        });

    }
});

router.get("/chats", optionalAuth, async (req, res) => {
    try {

        const userId = req.user.id;

        const chats = await ChatCollection.find({ userId })
            .sort({ updatedAt: -1 });

        res.json(chats);

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch chats"
        });

    }
});

router.delete("/chat/:id", authenticate, async (req, res) => {
    try {

        const chatId = req.params.id;
        const userId = req.user.id;

        const chat = await ChatCollection.findOneAndDelete({
            _id: chatId,
            userId
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        res.json({
            success: true,
            message: "Chat deleted"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Failed to delete chat"
        });

    }
});
module.exports = router;