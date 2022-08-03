const ethers = require('ethers')
const { hexZeroPad } = require('ethers/lib/utils')
const TranferTransaction = require('../Models/tranferTransaction.model')
const Wallet = require('../Models/wallet.model')
const FBT = require('./FBT.json')
const FBB = require('./FBB.json')
const GAME = require('./Game.json')
const { FBT_ADDRESS, FBB_ADDRESS, rpc_url, privateKey, GAME_ADDRESS } = require('./config')
const BirdBox = require('../Models/birdBox.model')
const BirdBoxTransaction = require('../Models/birdBoxTransaction.model')
const { BirdBoxStatus } = require('../Enums')
const ClaimTokenTransaction = require('../Models/claimTokenTransaction.model')

const provider = new ethers.providers.JsonRpcProvider(rpc_url)
const fbtContractAbi = new ethers.utils.Interface(FBT.abi)
const fbbContractAbi = new ethers.utils.Interface(FBB.abi)
const gameContractAbi = new ethers.utils.Interface(GAME.abi)
const signer = new ethers.Wallet(privateKey, provider);
const gameContract = new ethers.Contract(GAME_ADDRESS, GAME.abi, signer)

const filter = {
    address: FBT_ADDRESS,
    topics: [
        ethers.utils.id("Transfer(address,address,uint256)"),
        null,
        hexZeroPad("0x76FabBaf92B890DaB71A25Ae0a5D7220f131ef8F", 32)
    ]
}

const mintBirdBoxFilter = {
    address: FBB_ADDRESS,
    topics: [
        ethers.utils.id("MintBirdBox(address,uint8,uint256)")
    ]
}

const tranferBirdBoxFilter = {
    address: FBB_ADDRESS,
    topics: [
        ethers.utils.id("Transfer(address,address,uint256)"),
        null,
        hexZeroPad("0x76FabBaf92B890DaB71A25Ae0a5D7220f131ef8F", 32)
    ]
}

const claimTokenFilter = {
    address: GAME_ADDRESS,
    topics: [
        ethers.utils.id("ClaimToken(address,uint256)")
    ]
}

provider.on(filter, async (data) => {
    try {
        console.log('first')
        let tranferTransaction = await TranferTransaction.findOne({ transactionHash: data.transactionHash })
        if (!tranferTransaction) {
            const d = fbtContractAbi.parseLog({
                topics: data.topics,
                data: data.data
            })
            let newTranferTransaction = new TranferTransaction({
                from: d.args[0],
                to: d.args[1],
                value: d.args[2].toString(),
                transactionHash: data.transactionHash
            })
            newTranferTransaction.save()

            let wallet = await Wallet.findOne({ onChainWallet: d.args[0] })
            if (wallet) {
                console.log('wallet', wallet)
                const currentFbtBalance = new ethers.BigNumber.from(wallet.fbtBalance)
                wallet.fbtBalance = currentFbtBalance.add(d.args[2]).toString()
                console.log('wallet.fbtBalance', wallet.fbtBalance, d.args[2].toString())
                wallet.save()
            }
        }
    } catch (error) {
        console.log('error', error)
    }
})

provider.on(mintBirdBoxFilter, async (data) => {
    try {
        const birdBoxTransaction = await BirdBoxTransaction.findOne({ transactionHash: data.transactionHash })
        if (!birdBoxTransaction) {
            const d = fbbContractAbi.parseLog({
                topics: data.topics,
                data: data.data
            })
            let boxType = d.args[1]
            let newBirdBoxData = {
                ownerAddress: d.args[0],
                boxType,
                tokenId: d.args[2].toNumber(),
            }

            if (boxType == 1) {
                newBirdBoxData.name = 'COMMON'
                newBirdBoxData.image = '/images/box_1.png'
            }
            if (boxType == 2) {
                newBirdBoxData.name = 'COSMETIC'
                newBirdBoxData.image = '/images/box_2.png'
            }
            if (boxType == 3) {
                newBirdBoxData.name = 'LEGENDARY'
                newBirdBoxData.image = '/images/box_3.png'
            }

            let newBirdBox = new BirdBox(newBirdBoxData)
            newBirdBox.save()
        }
    } catch (error) {
        console.log('error', error)
    }
})


provider.on(tranferBirdBoxFilter, async (data) => {
    try {
        const birdBoxTransaction = await BirdBoxTransaction.findOne({ transactionHash: data.transactionHash })
        if (!birdBoxTransaction) {
            const d = fbbContractAbi.parseLog({
                topics: data.topics,
                data: data.data
            })

            let newbirdBoxTransaction = new BirdBoxTransaction({
                from: d.args[0],
                to: d.args[1],
                tokenId: d.args[2].toString(),
                transactionHash: data.transactionHash
            })
            newbirdBoxTransaction.save()

            const birdBox = await BirdBox.findOne({ tokenId: d.args[2].toNumber() })
            if (birdBox) {
                console.log(d.args[2].toNumber())
                let wallet = await Wallet.findOne({ onChainWallet: d.args[0] })
                if (wallet) {
                    birdBox.ownerAddress = d.args[1]
                    birdBox.status = BirdBoxStatus.INGAME
                    birdBox.user = wallet.user
                    birdBox.save()
                    console.log('birdBox', birdBox)
                }
            }
        }
    } catch (error) {
        console.log('error', error)
    }
})

provider.on(claimTokenFilter, async (data) => {
    try {
        console.log('first')
        let claimTokenTransaction = await ClaimTokenTransaction.findOne({ transactionHash: data.transactionHash })
        if (!claimTokenTransaction) {
            const d = gameContractAbi.parseLog({
                topics: data.topics,
                data: data.data
            })

            let newClaimTokenTransaction = new ClaimTokenTransaction({
                to: d.args[0],
                amount: d.args[1].toString(),
                transactionHash: data.transactionHash
            })
            newClaimTokenTransaction.save()

            let wallet = await Wallet.findOne({ onChainWallet: d.args[0] })
            if (wallet) {
                const currentFbtLockBalance = new ethers.BigNumber.from(wallet.fbtLockBalance)
                wallet.fbtLockBalance = currentFbtLockBalance.sub(d.args[1]).toString()
                console.log('wallet.fbtBalance', wallet.fbtLockBalance, d.args[1].toString())
                wallet.save()
            }
        }
    } catch (error) {
        console.log('error', error)
    }
})

module.exports = {
    provider,
    signer,
    gameContract
}