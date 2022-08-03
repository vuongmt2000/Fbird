const ethers = require('ethers')
const FBT = require('./src/Contracts/FBT.json')
const FBB = require('./src/Contracts/FBB.json');
const { rpc_url, FBT_ADDRESS, FBB_ADDRESS, privateKey } = require('./src/Contracts/config');

const provider = new ethers.providers.JsonRpcProvider(rpc_url)
let signer = new ethers.Wallet(privateKey, provider);
const ownerAddress = signer.getAddress()

const run = async () => {
    const fbbContract = new ethers.Contract(FBB_ADDRESS, FBB.abi, signer)
    const owner = signer.getAddress()
    const nftBalance = await fbbContract.balanceOf(owner)

    let items = []

    for (let i = 0; i < nftBalance.toString(); i++) {
        const tokenId = await fbbContract.tokenOfOwnerByIndex(owner, i)
        const tokenUri = await fbbContract.tokenURI(tokenId)
        console.log('tokenId', tokenUri)
        // const meta = await axios.get(tokenUri)
        // let item = {
        //     tokenId: tokenId,
        //     name: meta.data.name,
        //     description: meta.data.description,
        //     image: meta.data.image,
        // }
        // items.push(tokenId)
    }
}

run()