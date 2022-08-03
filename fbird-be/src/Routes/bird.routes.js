const express = require("express");
const router = express.Router();
const birdController = require("../Controllers/bird.controllers");
const auth = require("../Middleware/auth.middleware");

router.get("/get_my_birds", auth, birdController.getMyBirds);
router.get("/get_bird/:id", auth, birdController.getBird);
router.post("/open_bird_box", auth, birdController.mintBird);
router.get("/bird_on_sale", auth, birdController.birdOnSale);
router.post("/sale_bird", auth, birdController.saleBird);
router.post("/de_sale_bird", auth, birdController.deSaleBird);
router.post("/buy_bird", auth, birdController.buyBird);
router.post("/update_bird", birdController.updateBird);

module.exports = router;