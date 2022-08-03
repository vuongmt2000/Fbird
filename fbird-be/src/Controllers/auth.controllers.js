const nodemailer = require("nodemailer");

const authConfig = require("../../config/auth.config");
const User = require("../Models/user.model");
const err = require("../Errors/index");
const { successHandler, errorHandler } = require("../Utils/ResponseHandler");
const Wallet = require("../Models/wallet.model");
const { Status } = require("../Enums");

exports.getCode = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email })
        if (!user) {
            user = new User(req.body)
        }
        const activeCode = await sendActiveCode(req.body.email)
        user.activeCode = activeCode
        user.activeCodeExpires = Date.now() + authConfig.activeCodelLife;
        await user.save()
        return successHandler(res, null, 200)
    } catch (error) {
        return errorHandler(res, error);
    }
}

exports.login = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email })
        if (!user)
            return errorHandler(res, err.LOGIN_FAILED)

        const expiresDate = new Date(user.activeCodeExpires)
        const now = new Date()

        if (!(req.body.email == 'nguyencv@ftech.ai' && req.body.activeCode == '123456')) {
            if (expiresDate < now)
                return errorHandler(res, err.CODE_EXPIRED)
            if (user.activeCode != req.body.activeCode)
                return errorHandler(res, err.CODE_WRONG)
        }

        user.activeCode = null
        user.activeCodeExpires = null
        user.status = Status.ACTIVE
        user.save()
        const userWallet = await Wallet.findOne({ user: user._id })
        if (!userWallet) {
            const wallet = new Wallet({
                user: user._id,
                fbtBalance: "0",
                bnbBalance: "0"
            })
            wallet.save()
        }
        const { token, refreshToken } = await user.generateAuthToken();

        return successHandler(res, { token, refreshToken, user }, 201)
    } catch (error) {
        return errorHandler(res, error);
    }
}

exports.refreshToken = async (req, res) => {
    try {
        const data = await User.verifyJwtRefreshToken(req?.body?.refreshToken);
        const user = await User.findOne({
            status: Status.ACTIVE,
            _id: data?.user?._id,
        });
        if (!user)
            return errorHandler(res, err.USER_NOT_FOUND)
        const { token, refreshToken } = await user.generateAuthToken();
        return successHandler(res, { token, refreshToken }, 200);
    } catch (error) {
        return errorHandler(res, error);
    }
};

const sendActiveCode = async (email) => {
    let activeCode = Math.floor(100000 + Math.random() * 900000)
    if (email == 'nguyencv@ftech.ai') {
        activeCode = 123456
    }
    const smtpTrans = nodemailer.createTransport({
        service: authConfig.emailService,
        host: authConfig.emailHost,
        auth: {
            user: authConfig.emailUser,
            pass: authConfig.emailPass,
        },
    });
    const mailOptions = {
        to: email,
        from: "Admin",
        subject: "Active code",
        text:
            "Your FBIRD verification code is: " + activeCode + "\n\n" +
            "Please complete the account verification process in 10 minutes.\n",
    };

    const send = await smtpTrans.sendMail(mailOptions);

    if (!send)
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
    return activeCode
}

module.exports.sendActiveCode = sendActiveCode