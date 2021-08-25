import { ethers, run } from 'hardhat';
import { EBlockStock } from '../typechain';

async function deploySmartContract() {
  await run('compile');

  const [owner] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', owner.address);

  console.log('Account balance:', (await owner.getBalance()).toString());
  const EBSOToken = await ethers.getContractFactory('EBlockStock');
  const eBSO: EBlockStock = (await EBSOToken.deploy()) as EBlockStock;

  await eBSO.deployed();

  console.log(`eBSOFactory deployed! Address: ${eBSO.address}`);
}

deploySmartContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
