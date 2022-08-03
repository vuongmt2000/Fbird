const mongoose = require("mongoose");

const claimTokenTransactionSchema = mongoose.Schema({
    to: String,
    amount: String,
    transactionHash: String
})

const ClaimTokenTransaction = mongoose.model("ClaimTokenTransaction", claimTokenTransactionSchema);
module.exports = ClaimTokenTransaction;