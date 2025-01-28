const Course = require("../modals/cource.model");
const Payment = require("../modals/payment.modal"); // Adjust path if necessary
const { INTERNAL_SERVER_ERROR, OK } = require("../utils/httpCodeStatus");

const getMonthlyPayments = async (req, res) => {
    try {
        const { year } = req.query;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();

        const startOfYear = new Date(currentYear, 0, 1); // January 1st
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59); // December 31st

        // Aggregate payments grouped by month
        // Aggregate payments grouped by month and count enrollments
        const [monthlyPayments, totalEarnings, totalEnrollments] = await Promise.all([
            Payment.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfYear, $lte: endOfYear }, // Filter by year
                        status: "success", // Consider only successful payments
                    },
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" }, // Group by month
                        totalAmount: { $sum: "$amount" }, // Sum the amounts for each month
                    },
                },
                {
                    $sort: { _id: 1 }, // Sort by month
                },
            ]),
            Payment.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfYear, $lte: endOfYear }, // Filter by year
                        status: "success", // Consider only successful payments
                    },
                },
                {
                    $group: {
                        _id: null, // Group by nothing to get the total sum
                        totalAmount: { $sum: "$amount" },
                    },
                },
            ]),
            Course.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfYear, $lte: endOfYear }, // Filter by year
                    },
                },
                {
                    $unwind: "$enrolled", // Flatten the enrolled array
                },
                {
                    $group: {
                        _id: null, // Group by nothing to get the total count
                        totalEnrollments: { $sum: 1 }, // Count the number of enrollments
                    },
                },
            ]),
        ]);

        // Map month numbers to names
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ];

        // Format the result to include month names
        const formattedData = monthlyPayments.map((payment) => ({
            month: monthNames[payment._id - 1], // Convert month number to month name
            totalAmount: payment.totalAmount || 0,
        }));
        const totalAmount = totalEarnings[0]?.totalAmount || 0;
        const totalEnrollmentsCount = totalEnrollments[0]?.totalEnrollments || 0;
        // Respond with the formatted data
        res.status(OK).json({
            data: formattedData,
            totalEarnings: totalAmount,
            totalEnrollments: totalEnrollmentsCount,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching monthly payments:", error);
        res.status(INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Server error while fetching monthly payments.",
        });
    }
};

module.exports = { getMonthlyPayments };
