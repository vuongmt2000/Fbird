const ethers = require('ethers')
const FBT = require('./src/Contracts/FBT.json')
const FBB = require('./src/Contracts/FBB.json');
const { rpc_url, FBT_ADDRESS, FBB_ADDRESS, privateKey } = require('./src/Contracts/config');

const provider = new ethers.providers.JsonRpcProvider(rpc_url)
let signer = new ethers.Wallet(privateKey, provider);
const ownerAddress = signer.getAddress()
const tokenContract = new ethers.Contract(FBB_ADDRESS, FBB.abi, signer)

const run = async () => {
    const nftBalance = await tokenContract.balanceOf(ownerAddress)
    let items = []

    for (let i = 0; i < nftBalance.toString(); i++) {
        const tokenId = await tokenContract.tokenOfOwnerByIndex(ownerAddress, i)
        let transaction = await tokenContract["safeTransferFrom(address,address,uint256)"](ownerAddress, '0x76FabBaf92B890DaB71A25Ae0a5D7220f131ef8F', tokenId.toNumber())
        let tx = await transaction.wait()
        console.log('tx', tx)
        console.log('tokenId', tokenId)
    }
}

run()