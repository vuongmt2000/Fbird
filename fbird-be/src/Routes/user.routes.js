const express = require("express");
const router = express.Router();
const userController = require("../Controllers/user.controllers");
const auth = require("../Middleware/auth.middleware");

router.get("/me", auth, userController.getMe);

module.exports = router;