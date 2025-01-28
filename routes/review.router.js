const express = require("express");
const router = express.Router({ mergeParams: true });

const Review = require("../modals/review.modal");
const Course = require("../modals/cource.model");
const authenticate = require("../middlewares/authenticate");

router.post("/review/:id",authenticate, async (req, res) => {
    const { id } = req.params;

    const { comment, rating } = req.body;
    // Basic validation
    if (!req.user || !req.user._id) {
        return res.status(401).json({ msg: "User not " });
    }
    if (!comment || !rating) {
        return res.status(400).json({ msg: "Comment and rating are required" });
    }
    try {
        const course = await Course.findById(id);
        if (!course) {
            res.status(500).send({ success: false, message: "Cource Not Found" });
        }
        const newReview = new Review({ comment, rating, author: req.user._id })
        await newReview.save()
        course.reviews.push(newReview);
        await course.save();
        
        res.status(200).json({ msg: "Review added successfully", newReview });

    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

router.delete("/:Cid/delReview/:Rid", async (req, res) => {
    const { Lid, Rid } = req.params;
    await Course.findByIdAndUpdate(Lid, { $pull: { review: Rid } });
    await Review.findByIdAndDelete(Rid);
    if (!Review) {
        res.status(401).json({ msg: "Delete Failed" })
    }
    res.status(200).json({ msg: "Review Deletes" })
})
module.exports = router;