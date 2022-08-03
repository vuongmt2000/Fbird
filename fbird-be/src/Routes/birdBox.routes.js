const express = require("express");
const router = express.Router();

const birdBoxController = require("../Controllers/birdBox.controllers");
const auth = require("../Middleware/auth.middleware");

router.get("/nft/:id", birdBoxController.getDetail);
router.get("/my_bird_box", auth, birdBoxController.getMyBirdBox);

module.exports = router;