const User = require("../Models/user.model");
const Wallet = require("../Models/wallet.model");
const { successHandler, errorHandler } = require("../Utils/ResponseHandler");
const { sendActiveCode } = require("./auth.controllers");
const authConfig = require("../../config/auth.config");
const err = require("../Errors/index");
const { Status } = require("../Enums");
const { utils, ethers } = require("ethers");
const { gameContract, signer } = require("../Contracts");


exports.getBalance = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ user: req.user._id })
        return successHandler(res, { wallet }, 200)
    } catch (error) {
        return errorHandler(res, error);
    }
}

exports.getCode = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ user: req.user._id })
        const user = await User.findOne({ _id: req.user._id })
        console.log('wallet,user', wallet, user)
        if (wallet && user) {
            const activeCode = await sendActiveCode(user.email)
            wallet.activeCode = activeCode
            wallet.activeCodeExpires = Date.now() + authConfig.activeCodelLife;
            wallet.save()
            return successHandler(res, null, 200)
        } else
            return errorHandler(res, err.LOGIN_FAILED)
    } catch (error) {
        return errorHandler(res, error);
    }
}

exports.addWallet = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ user: req.user._id })
        if (!wallet) {
            return errorHandler(res, err.LOGIN_FAILED)
        }

        if (!utils.isAddress(req.body.onChainWallet)) {
            return errorHandler(res, err.WRONG_WALLET)
        }

        const duplicateWallet = await Wallet.findOne({ onChainWallet: req.body.onChainWallet })
        if (duplicateWallet?.user == req.user._id)
            return errorHandler(res, err.DUPTICATE_WALLET)
        const expiresDate = new Date(wallet.activeCodeExpires)
        const now = new Date()

        if (expiresDate < now)
            return errorHandler(res, err.CODE_EXPIRED)
        if (wallet.activeCode != req.body.activeCode)
            return errorHandler(res, err.CODE_WRONG)

        wallet.activeCode = null
        wallet.activeCodeExpires = null
        wallet.onChainWalletStatus = Status.ACTIVE
        wallet.onChainWallet = req.body.onChainWallet
        wallet.save()

        return successHandler(res, { wallet }, 201)
    } catch (error) {
        return errorHandler(res, error);
    }
}

exports.leaderbroad = async (req, res) => {
    try {
        let page = (req?.query?.page || 1) * 1
        let limit = (req?.query?.limit || 10) * 1
        const skip = (page - 1) * limit;
        const wallets = await Wallet.find({ onChainWalletStatus: Status.ACTIVE }).limit(limit).skip(skip);
        wallets.sort((a, b) => {
            const aPrice = utils.formatUnits(a.fbtBalance, 18) * 1
            const bPrice = utils.formatUnits(b.fbtBalance, 18) * 1
            return bPrice - aPrice
        })
        const total = await Wallet.count({ onChainWalletStatus: Status.ACTIVE })
        return successHandler(res, {
            wallets,
            paginate: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit),
            },
        }, 201)
    } catch (error) {
        return errorHandler(res, error);
    }
}

exports.findWallet = async (req, res) => {
    const wallet = await Wallet.findOne({ onChainWallet: req.body.onChainWallet })
    const user = await User.findOne({ _id: wallet.user })
    return successHandler(res, { wallet, user }, 200)
}

exports.updateClaimBalance = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ user: req.user._id })
        const amountNum = utils.formatUnits(req?.body?.amount || '0', 18) * 1

        if (amountNum < 0)
            return errorHandler(res, err.AMOUNT_ERROR)
        const fbtNum = utils.formatUnits(wallet.fbtBalance, 18) * 1
        if (fbtNum < amountNum)
            return errorHandler(res, err.NOT_ENOUGH_BALANCE)
        const transaction = await gameContract.updateBalance(wallet.onChainWallet, req?.body?.amount)
        let tx = await transaction.wait()
        let to = tx.events[0].args[0]
        let amount = tx.events[0].args[1]
        let amountTxNum = utils.formatUnits(tx.events[0].args[1], 18) * 1
        if (to == wallet.onChainWallet && amountTxNum == amountNum) {
            const currentFbtBalance = new ethers.BigNumber.from(wallet.fbtBalance)
            const currentFbtLockBalance = new ethers.BigNumber.from(wallet.fbtLockBalance)
            wallet.fbtBalance = currentFbtBalance.sub(amount).toString()
            wallet.fbtLockBalance = currentFbtLockBalance.add(amount).toString()
            wallet.save()
            return successHandler(res, { wallet }, 200)
        } else {
            return errorHandler(res, err.AMOUNT_ERROR)
        }
    } catch (error) {
        return errorHandler(res, error);
    }
}