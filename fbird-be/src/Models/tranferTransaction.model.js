const mongoose = require("mongoose");

const tranferTransactionSchema = mongoose.Schema({
    from: String,
    to: String,
    value: String,
    transactionHash: String
})

const TranferTransaction = mongoose.model("TranferTransaction", tranferTransactionSchema);
module.exports = TranferTransaction;