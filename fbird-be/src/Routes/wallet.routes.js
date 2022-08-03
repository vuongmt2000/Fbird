const express = require("express");
const router = express.Router();
const walletController = require("../Controllers/wallet.controllers");
const auth = require("../Middleware/auth.middleware");
const { wallet } = require("../Middleware/validators.middleware");

router.get("/get_balance", auth, walletController.getBalance);
router.get("/get_code", auth, walletController.getCode);
router.post("/add_wallet", auth, wallet.addWallet, walletController.addWallet);
router.get("/leaderbroad", auth, walletController.leaderbroad);
router.post("/find_wallet", auth, walletController.findWallet);
router.post("/update_claim_balance", auth, walletController.updateClaimBalance);

module.exports = router;