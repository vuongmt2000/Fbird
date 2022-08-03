const User = require("../Models/user.model");
const { errorHandler, successHandler } = require("../Utils/ResponseHandler");
const err = require("../Errors/index");

exports.getMe = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id }).select("-activeCode -activeCodeExpires")
        if (!user) {
            return errorHandler(res, err.USER_NOT_FOUND)
        }
        return successHandler(res, { user }, 200)
    } catch (error) {
        return errorHandler(res, error);
    }
}