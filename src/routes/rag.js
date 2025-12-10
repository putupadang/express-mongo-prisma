const { Router } = require("express");
const controller = require("../controllers/ragController");

const router = Router();

router.post("/query", controller.query);

module.exports = router;
