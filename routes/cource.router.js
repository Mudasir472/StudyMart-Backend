const express = require("express");
const router = express.Router({ mergeParams: true });
const authenticate = require("../middlewares/authenticate.js")
const isCourceOwner = require('../middlewares/isCourceOwner.js')
const { storage } = require("../cloudConfig.js");
const multer = require('multer');
const upload = multer({ storage });

const { getCource, enrollCource, createCource, getVideos, deleteCource, deleteVideo, updateCource, deleteImages } = require("../controllers/cource.controller.js");
const { getMonthlyPayments } = require("../controllers/payment.controller.js");

router.get("/getcourse", getCource);
router.post("/api/enroll", authenticate, enrollCource)
router.post("/createcource", authenticate, upload.fields([
    { name: 'images', maxCount: 5 },
]), createCource)
router.delete("/api/deleteCource/:courseId", authenticate, isCourceOwner, deleteCource)
router.get("/api/courses/:courseId/videos", authenticate, getVideos);
router.delete('/removeVideo/:courseId/:videoId', authenticate, isCourceOwner, deleteVideo)
router.delete('/removeImage/:courseId/:imageId', authenticate, isCourceOwner, deleteImages)
router.put('/updateCource/:courseId', upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 10 }
]), authenticate, isCourceOwner, updateCource);


// Payment Router
router.get("/monthly-payments/:teacherId", authenticate, getMonthlyPayments);

module.exports = router;
