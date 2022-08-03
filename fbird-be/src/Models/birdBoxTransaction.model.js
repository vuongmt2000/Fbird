const mongoose = require("mongoose");

const birdBoxTransactionSchema = mongoose.Schema({
    from: String,
    to: String,
    tokenId: String,
    transactionHash: String
})

const BirdBoxTransaction = mongoose.model("BirdBoxTransaction", birdBoxTransactionSchema);
module.exports = BirdBoxTransaction;