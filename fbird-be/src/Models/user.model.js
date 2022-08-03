const mongoose = require("mongoose");
const validator = require("validator");
const { Status } = require("../Enums");
const err = require("../Errors/index");
const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth.config");

const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            validate: (value) => {
                if (!validator.isEmail(value))
                    throw new Error(err.INVALID_EMAIL.messageCode);
            },
        },
        activeCode: String,
        activeCodeExpires: Date,
        status: {
            type: String,
            enum: Object.keys(Status),
            default: Status.DEACTIVE,
        },
    },
    { timestamps: true }
);

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ user: user.toJSON() }, authConfig.secret, {
        expiresIn: authConfig.tokenLife,
    });
    const refreshToken = jwt.sign(
        { user: user.toJSON() },
        authConfig.refreshTokenSecret,
        {
            expiresIn: authConfig.refreshTokenLife,
        }
    );
    return { token, refreshToken, user };
};
const verifyJwt = async (token, secret) => {
    try {
        return await jwt.verify(token, secret);
    } catch (error) {
        if (error.message === "jwt expired")
            throw new Error(err.TOKEN_EXPIRED.messageCode)
        throw new Error(error)
    }
}

userSchema.statics.verifyJwtToken = async (token) => await verifyJwt(token, authConfig.secret)
userSchema.statics.verifyJwtRefreshToken = async (token) => await verifyJwt(token, authConfig.refreshTokenSecret)


userSchema.statics.findByCredentials = async (email, password) => {
    let user = await User.findOne({ email });
    if (!user) {
        throw new Error(err.LOGIN_INVALID.messageCode);
    }
    if (authConfig.isActiveByMail) {
        if (user.status !== Status.ACTIVE) {
            throw new Error(err.ACCOUNT_DEACTIVE.messageCode);
        }
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error(err.LOGIN_INVALID.messageCode);
    }

    return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;