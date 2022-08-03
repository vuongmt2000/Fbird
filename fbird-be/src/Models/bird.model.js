const mongoose = require("mongoose");

const birdSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    star: Number,
    tokenId: Number,
    name: String,
    image: {
        type: String,
        validate: (value) => {
            if (!/([/|.|\w|\s|-])*\.(?:jpg|gif|png)/.test(value))
                throw new Error(err.INVALID_IMAGE.messageCode);
        },
    },
    onSale: {
        type: Boolean,
        default: false
    },
    price: {
        type: String,
        default: '0'
    },
    priceInNumber: {
        type: Number,
        default: 0
    },
    energy: {
        type: Number,
        default: 2
    },
    lastTimePlay: {
        type: Date,
        default: Date.now()
    },
    maxEarnPerTurn: Number
})

const Bird = mongoose.model("Bird", birdSchema);
module.exports = Bird;