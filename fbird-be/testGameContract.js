const ethers = require('ethers')
const FBT = require('./src/Contracts/FBT.json')
const GAME = require('./src/Contracts/Game.json');
const { rpc_url, privateKey, GAME_ADDRESS } = require('./src/Contracts/config');

const provider = new ethers.providers.JsonRpcProvider(rpc_url)
let signer = new ethers.Wallet(privateKey, provider);
const ownerAddress = signer.getAddress()
let GameContract = new ethers.Contract(GAME_ADDRESS, GAME.abi, signer)

const run = async () => {
    const amount = ethers.utils.parseUnits('1000', 18)
    let transaction = await GameContract.updateBalance(ownerAddress, amount)
    let tx = await transaction.wait()
}

run()