const express = require("express");
const router = express.Router();
const authController = require("../Controllers/auth.controllers");
const validate = require("../Middleware/validators.middleware");

router.post("/get_code", validate.auth.getCode, authController.getCode);
router.post("/login", validate.auth.login, authController.login);
router.post("/refresh_token", validate.auth.refreshToken, authController.refreshToken);

module.exports = router;