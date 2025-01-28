const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["success", "failed", "pending"],
            default: "pending",
        },
        transactionId: {
            type: String,
            required: false,
        },
        paymentMethod: {
            type: String,
            enum: ["card", "paypal", "bank_transfer"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
