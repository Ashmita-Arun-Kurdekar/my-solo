const router = require("express").Router();
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { predictOne, predictAll, autoAssign, getAllocations } = require("../controllers/allocationController");
router.post("/predict-role/:id", verifyToken, authorizeRoles(1, 2), predictOne);
router.post("/predict-all", verifyToken, authorizeRoles(1, 2), predictAll);
router.post("/projects/:id/auto-assign", verifyToken, authorizeRoles(1, 2), autoAssign);
router.get("/allocations", verifyToken, authorizeRoles(1, 2), getAllocations);
module.exports = router;
