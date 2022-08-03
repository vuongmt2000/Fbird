const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../Models/user.model");
const err = require("../Errors/index");
const authConfig = require("../../config/auth.config");
const Bird = require("../Models/bird.model");
const { Status } = require("../Enums");
const { isObjectIdOrHexString } = require("mongoose");
const Wallet = require("../Models/wallet.model");
const { ethers, utils } = require("ethers");
const { calculatorTokenReward } = require("./CalculatorTokenReward");

module.exports = async (io) => {
    try {
        io.use(async (socket, next) => {
            if (socket.handshake.auth && socket.handshake.auth.token) {
                console.log('socket?.handshake?.auth?.token', socket?.handshake?.auth?.token)
                const bearerToken = socket?.handshake?.auth?.token || "";
                let token = null
                if (typeof bearerToken === 'string') {
                    token = bearerToken.replace("Bearer ", "")
                }
                try {
                    const data = await jwt.verify(token, authConfig.secret);
                    const user = await User.findOne({
                        status: Status.ACTIVE,
                        _id: data.user._id,
                        "tokens.token": token,
                    });
                    console.log('user', user)
                    if (!user)
                        next(new Error(JSON.stringify(err.TOKEN_EXPIRED)))
                    else
                        next();
                } catch (error) {
                    next(new Error(JSON.stringify(err.TOKEN_EXPIRED)))
                }
            } else {
                next(new Error(JSON.stringify(err.TOKEN_WRONG)))
            }
        });
        io.on('connection', async (socket) => {
            console.log('new connection')
            const bearerToken = socket?.handshake?.auth?.token || "";
            let token = null
            if (typeof bearerToken === 'string') {
                token = bearerToken.replace("Bearer ", "")
            }

            socket.on('start_game', async birdId => {
                const data = await jwt.verify(token, authConfig.secret);
                const user = await User.findOne({
                    status: Status.ACTIVE,
                    _id: data.user._id,
                    "tokens.token": token,
                });
                if (!user)
                    socket.emit('error', JSON.stringify(err.TOKEN_EXPIRED))
                else {
                    if (!isObjectIdOrHexString(birdId)) {
                        socket.emit('error', JSON.stringify(err.BIRD_NOT_EXITS))
                    } else {
                        const bird = await Bird.findOne({ _id: birdId })
                        if (!bird)
                            socket.emit('error', err.BIRD_NOT_EXITS)
                        else if (bird.user.toString() != data.user._id.toString())
                            socket.emit('error', err.NOT_PERMISSION)
                        else if (bird.energy == 0)
                            socket.emit('error', err.OUT_OF_ENERGY)
                        else if (bird.onSale)
                            socket.emit('error', err.BIRD_IN_MARKET)
                        else {
                            const gameId = crypto.randomBytes(6).toString("hex");
                            socket.emit('start_game_success', gameId)
                            let token = 0
                            if (bird.energy == 2)
                                bird.lastTimePlay = Date.now()
                            bird.energy = bird.energy - 1
                            bird.save()
                            socket.on(gameId, async point => {
                                token = calculatorTokenReward(point, bird.star)
                                socket.emit(gameId, token)
                            })
                            socket.on(`end_game_${gameId}`, async () => {
                                if (token > 0) {
                                    const wallet = await Wallet.findOne({ user: data.user._id })
                                    const currentFbtBalance = new ethers.BigNumber.from(wallet.fbtBalance)
                                    wallet.fbtBalance = currentFbtBalance.add(utils.parseUnits(token.toString(), 18)).toString()
                                    wallet.save()
                                }
                                socket.emit('end_game_success', { reward: utils.parseUnits(token.toString(), 18).toString() })
                                socket.off(gameId, args => console.log('args', args));
                                socket.off(`end_game_${gameId}`, args => console.log('args', args));
                            })
                        }
                    }
                }
            })

        })
        return io
    } catch (error) {
        console.log(`error`, error)
    }
}