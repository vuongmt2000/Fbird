const mongoose = require("mongoose");
const { Status } = require("../Enums");

const walletSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    onChainWallet: {
        type: String,
        default: null,
    },
    onChainWalletStatus: {
        type: String,
        enum: Object.keys(Status),
        default: Status.DEACTIVE,
    },
    fbtBalance: {
        type: String,
        default: "0",
    },
    fbtLockBalance: {
        type: String,
        default: "0",
    },
    bnbBalance: {
        type: String,
        default: "0",
    },
    activeCode: String,
    activeCodeExpires: Date,
})

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;