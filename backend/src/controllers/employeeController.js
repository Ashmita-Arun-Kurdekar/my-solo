const {
  getAllEmployees,
  getManagers,
  deleteEmployee,
  updateEmployee,
} = require("../models/employeeModel");

const getEmployees = async (req, res) => {

    try {

        const result = await getAllEmployees();

        res.json({
            success: true,
            employees: result.rows
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
const getManagersList = async (req, res) => {
  try {
    const result = await getManagers();

    res.json({
      success: true,
      managers: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const removeEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteEmployee(id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      full_name,
      phone,
      designation,
      department_id,
    } = req.body;

    const result = await updateEmployee(
      id,
      full_name,
      phone,
      designation,
      department_id
    );

    res.json({
      success: true,
      employee: result.rows[0],
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
  getEmployees,
  getManagersList,
  removeEmployee,
  editEmployee,
};