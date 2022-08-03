const ethers = require('ethers')
const FBT = require('./src/Contracts/FBT.json')
const FBB = require('./src/Contracts/FBB.json');
const { rpc_url, FBT_ADDRESS, FBB_ADDRESS, privateKey } = require('./src/Contracts/config');

const provider = new ethers.providers.JsonRpcProvider(rpc_url)
let signer = new ethers.Wallet(privateKey, provider);
const ownerAddress = signer.getAddress()

const run = async () => {
    let FBTContract = new ethers.Contract(FBT_ADDRESS, FBT.abi, signer)
    let allowance = await FBTContract.allowance(ownerAddress, FBB_ADDRESS)
    let numberAllowance = ethers.utils.formatEther(allowance)
    const amount = ethers.utils.parseUnits('10000000000', 'ether')

    if (numberAllowance == 0.0) {
        let approve = await FBTContract.approve(FBB_ADDRESS, amount)
        if (approve)
            console.log('approve success')
    } else {
        console.log('first')
        let contract = new ethers.Contract(FBB_ADDRESS, FBB.abi, signer)
        let transaction = await contract.mintBirdBox(2)
        let tx = await transaction.wait()
        console.log('tx', tx)
    }
}

run()