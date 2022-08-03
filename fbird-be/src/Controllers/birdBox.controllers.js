const { errorHandler, successHandler } = require("../Utils/ResponseHandler");
const err = require("../Errors/index");
const BirdBox = require("../Models/birdBox.model");
const { BirdBoxStatus } = require("../Enums");

exports.getDetail = async (req, res) => {
    try {
        const tokenId = req?.params?.id
        const birdBox = await BirdBox.findOne({ tokenId })
        const domain = req?.headers?.host;
        return res.status(200).json({
            name: birdBox.name,
            description: birdBox.description,
            image: `http://${domain}${birdBox.image}`,
            boxType: birdBox.boxType
        })
    } catch (error) {
        return errorHandler(res, error);
    }
}

exports.getMyBirdBox = async (req, res) => {
    try {
        const birdBoxs = await BirdBox.find({
            status: BirdBoxStatus.INGAME,
            user: req.user._id
        }).select("_id boxType tokenId name description image user")
        const domain = req?.headers?.host;
        birdBoxs.map((item, index) => {
            item.image = `http://${domain}${item.image}`
        })
        successHandler(res, { birdBoxs }, 200)
    } catch (error) {
        return errorHandler(res, error);
    }
}