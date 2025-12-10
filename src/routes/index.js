const { Router } = require("express");
const userRoutes = require("./users");
const ragRoutes = require("./rag");

const router = Router();

router.use("/users", userRoutes);
router.use("/rag", ragRoutes);

module.exports = router;
