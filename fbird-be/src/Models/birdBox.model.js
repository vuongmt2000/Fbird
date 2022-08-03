const mongoose = require("mongoose");
const { BirdBoxStatus } = require("../Enums");

const birdBoxSchema = mongoose.Schema({
    ownerAddress: String,
    boxType: Number,
    tokenId: Number,
    name: String,
    description: {
        type: String,
        default: null
    },
    image: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    status: {
        type: String,
        default: BirdBoxStatus.ONCHAIN
    }
})

const BirdBox = mongoose.model("BirdBox", birdBoxSchema);
module.exports = BirdBox;