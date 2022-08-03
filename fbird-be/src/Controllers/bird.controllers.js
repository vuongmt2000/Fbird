const { utils, ethers } = require("ethers");

const Bird = require("../Models/bird.model");
const Wallet = require("../Models/wallet.model");
const { successHandler, errorHandler } = require("../Utils/ResponseHandler");
const err = require("../Errors/index");
const { MINT_CONFIG } = require("../Utils/randomBird");
const { network } = require("../../config/network.config");
const NFT = require('../Contracts/NFT.json');
const gameConfig = require("../../config/game.config");
const { BASE_REWAED, BASE_COEFFICIENT } = require("../Utils/CalculatorTokenReward");
const BirdBox = require("../Models/birdBox.model");
const { BirdBoxStatus } = require("../Enums");


exports.getMyBirds = async (req, res) => {
    try {
        const query = { user: req.user._id }
        if (req.query?.on_sale === 'true')
            query.onSale = true
        if (req.query?.on_sale === 'false')
            query.onSale = false
        const birds = await Bird.find(query).sort({ star: -1 })

        const resetTime = new Date(Date.now() - gameConfig.resetEnergyTime)

        await birds.map((item) => {
            const lastTimePlayDate = new Date(item.lastTimePlay)
            if (item.energy < 2 && lastTimePlayDate < resetTime) {
                item.energy = 2
                item.lastTimePlay = Date.now()
                item.save()
            }
        })
        const domain = req?.headers?.host;

        return successHandler(res, {
            birds: birds.map((item, index) => {
                let cloneItem = { ...item._doc }
                cloneItem.image = `http://${domain}${cloneItem.image}`
                return cloneItem
            })
        }, 200)
    } catch (error) {
        return errorHandler(res, error);
    }
}

exports.getBird = async (req, res) => {
    try {
        const bird = await Bird.findById(req.params.id);
        if (!bird)
            return errorHandler(res, err.BIRD_NOT_EXITS)
        const domain = req?.headers?.host;
        bird.image = `http://${domain}${bird.image}`
        return successHandler(res, { bird }, 200)
    } catch (error) {
        return errorHandler(res, error);
    }
}

exports.mintBird = async (req, res) => {
    try {
        const birdBox = await BirdBox.findOne({ _id: req?.body?.birdBoxId, status: BirdBoxStatus.INGAME })
        if (birdBox?.user?.toString() != req?.user?._id?.toString()) {
            return errorHandler(res, err.NOT_PERMISSION)
        }
        let freq = []
        switch (birdBox.boxType) {
            case 1:
                freq = MINT_CONFIG.commomFreq
                break;
            case 2:
                freq = MINT_CONFIG.goldFreq
                break;
            case 3:
                freq = MINT_CONFIG.legendFreq
                break;
            default:
                return errorHandler(res, err.WRONG_BOX_TYPE)
        }

        const star = randomRand(MINT_CONFIG.stars, freq, MINT_CONFIG.stars.length)
        const domain = req?.headers?.host;
        const data = {
            star,
            name: MINT_CONFIG.birdName[star - 1],
            image: `/images/${star}.png`
        }

        const bird = new Bird({
            ...data,
            tokenId: birdBox.tokenId,
            user: req.user._id,
            maxEarnPerTurn: BASE_REWAED * BASE_COEFFICIENT[star - 1]
        })
        bird.save()
        birdBox.status = BirdBoxStatus.OPENED
        birdBox.save()
        return successHandler(res, {
            bird: {
                ...bird._doc,
                image: `http://${domain}${bird.image}`
            }
        }, 200)
    } catch (error) {
        console.log('error', error)
        return errorHandler(res, error);
    }
}

exports.birdOnSale = async (req, res) => {
    try {
        const isLowToHigh = req.query.is_low_to_high
        const fromStar = req.query?.from_star
        const toStar = req.query?.to_star

        let page = (req?.query?.page || 1) * 1
        let limit = (req?.query?.limit || 10) * 1
        const skip = (page - 1) * limit;

        const query = {
            onSale: true
        }
        const sort = {}
        if (parseInt(fromStar) <= parseInt(toStar) && fromStar > 0 && toStar < 13)
            query.star = {
                $gte: fromStar * 1,
                $lte: toStar * 1
            }
        if (isLowToHigh === 'true')
            sort.priceInNumber = 1
        if (isLowToHigh === 'false')
            sort.priceInNumber = -1

        let birds = await Bird.find(query)
            .sort(sort)
            .limit(limit)
            .skip(skip);

        const domain = req?.headers?.host;
        birds.map((item, index) => {
            item.image = `http://${domain}${item.image}`
        })

        const total = await Bird.count(query)

        return successHandler(res, {
            birds,
            paginate: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit),
            },
        }, 200)
    } catch (error) {
        return errorHandler(res, error);
    }
}

exports.saleBird = async (req, res) => {
    try {
        const bird = await Bird.findOne({ _id: req.body.bird })
        if (!bird) {
            return errorHandler(res, err.BIRD_NOT_EXITS);
        }
        if (bird.onSale) {
            return errorHandler(res, err.BIRD_ON_SALE);
        }
        if (bird.user.toString() != req.user._id.toString()) {
            return errorHandler(res, err.NOT_PERMISSION);
        }
        bird.onSale = true
        bird.price = req.body.price
        bird.priceInNumber = utils.formatUnits(req.body.price, 18) * 1
        bird.save()
        const domain = req?.headers?.host;
        return successHandler(res, {
            bird: {
                ...bird._doc,
                image: `http://${domain}${bird.image}`
            }
        }, 200)
    } catch (error) {
        return errorHandler(res, error);
    }
}

exports.deSaleBird = async (req, res) => {
    try {
        const bird = await Bird.findOne({ _id: req.body.bird })
        if (!bird) {
            return errorHandler(res, err.BIRD_NOT_EXITS);
        }
        if (!bird.onSale) {
            return errorHandler(res, err.BIRD_NOT_ON_SALE);
        }
        if (bird.user.toString() != req.user._id.toString()) {
            return errorHandler(res, err.NOT_PERMISSION);
        }
        bird.onSale = false
        bird.price = "0"
        bird.priceInNumber = 0
        bird.save()
        const domain = req?.headers?.host;
        return successHandler(res, {
            bird: {
                ...bird._doc,
                image: `http://${domain}${bird.image}`
            }
        }, 200)
    } catch (error) {
        return errorHandler(res, error)
    }
}

exports.buyBird = async (req, res) => {
    try {
        const bird = await Bird.findOne({ _id: req.body.bird })
        if (!bird) {
            return errorHandler(res, err.UNKNOWN_ERROR);
        }
        if (req.user._id == bird.user) {
            return errorHandler(res, err.BUY_BIRD_DUPLICATE);
        }

        const userBuyWallet = await Wallet.findOne({ user: req.user._id })
        const userSaleWallet = await Wallet.findOne({ user: bird.user })

        const numBuyFbtBalance = utils.formatUnits(userBuyWallet.fbtBalance, 18) * 1
        const numSaleFbtBalance = utils.formatUnits(userSaleWallet.fbtBalance, 18) * 1
        const numBirdPrice = utils.formatUnits(bird.price, 18) * 1
        if (numBuyFbtBalance < numBirdPrice) {
            return errorHandler(res, err.NOT_ENOUGH_BALANCE)
        }

        userBuyWallet.fbtBalance = utils.parseUnits((numBuyFbtBalance - numBirdPrice).toString(), 18).toString()
        userSaleWallet.fbtBalance = utils.parseUnits((numSaleFbtBalance + numBirdPrice * 95 / 100).toString(), 18).toString()

        bird.onSale = false
        bird.price = "0"
        bird.priceInNumber = 0
        bird.user = req.user._id
        userBuyWallet.save()
        userSaleWallet.save()
        bird.save()
        const domain = req?.headers?.host;
        return successHandler(res, {
            bird: {
                ...bird._doc,
                image: `http://${domain}${bird.image}`
            }
        }, 200)
    } catch (error) {
        console.log('error', error)
        return errorHandler(res, error);
    }
}

exports.updateBird = async (req, res) => {
    try {
        const birds = await Bird.find({})
        birds.forEach(item => {
            // if (item.image.indexOf('192.168.22.90') > 0) {
            //     item.image = `/images/${item.star}.png`
            //     item.save()
            // }
            if (item.price) {
                item.priceInNumber = utils.formatUnits(item.price, 18)
                item.save()
            }
        })
        return successHandler(res, { birds }, 200)
    } catch (error) {

    }
}

// Utility function to find ceiling of r in arr[l..h]
const findCeil = (arr, r, l, h) => {
    let mid;
    while (l < h) {
        mid = l + ((h - l) >> 1); // Same as mid = (l+h)/2
        (r > arr[mid]) ? (l = mid + 1) : (h = mid);
    }
    return (arr[l] >= r) ? l : -1;
}

const randomRand = (arr, freq, n) => {
    // Create and fill prefix array
    let prefix = [];
    let i;
    prefix[0] = freq[0];
    for (i = 1; i < n; ++i)
        prefix[i] = prefix[i - 1] + freq[i];

    // prefix[n-1] is sum of all frequencies.
    // Generate a random number with
    // value from 1 to this sum
    let r = Math.floor((Math.random() * prefix[n - 1])) + 1;

    // Find index of ceiling of r in prefix array
    let indexc = findCeil(prefix, r, 0, n - 1);
    return arr[indexc];
}

const createToken = async (url, signer) => {
    let contract = new ethers.Contract(network.NFT_CONTRACT_ADDRESS, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()
    return tokenId
} 