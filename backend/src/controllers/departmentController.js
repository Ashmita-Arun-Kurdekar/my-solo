const {
  getAllDepartments,
} = require("../models/departmentModel");

const getDepartments = async (req, res) => {
  try {
    const result = await getAllDepartments();

    res.json({
      success: true,
      departments: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDepartments,
};