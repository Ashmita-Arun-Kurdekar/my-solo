const {
    getDashboardStats
} = require("../models/dashboardModel");

const dashboardStats = async (req, res) => {

    try {

        const stats = await getDashboardStats();

        res.json({
            success: true,
            stats
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    dashboardStats
};