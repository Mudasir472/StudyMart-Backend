const mongoose = require("mongoose");

const aiChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    title: {
        type: String,
        default: "New Chat"
    },

    messages: [
        {
            sender: String,
            text: String,
            time: {
                type: Date,
                default: Date.now
            }
        }
    ]

}, { timestamps: true });

const ChatCollection = mongoose.model("Chat", aiChatSchema);
module.exports = ChatCollection;