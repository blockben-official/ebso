import 'dotenv-safe/config';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import abiFunctions from '../../../abi/EBlockStock.json';
import artifact from '../../../artifacts/contracts/EBlockStock.sol/EBlockStock.json';
import { EBlockStock } from '../../../typechain/web3/EBlockStock';
import { TransactionConfig } from 'web3-core';

async function getGasPrice() {
  console.log('Start deploying contract...');

  //   const superadmin = process.env.SUPERADMIN_ADDRESS;
  //   const deployer = {
  //     address: process.env.DEPLOYER_ADDRESS,
  //     privateKey: process.env.DEPLOYER_PRIVATEKEY,
  //   };

  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NODE_URI!));

  let gasPrice = web3.utils.toBN('300000000000'); // 300 gwei

  // Check if gasPrice is more than 85 GWEI
  while (gasPrice.gte(web3.utils.toBN('65000000000'))) {
    gasPrice = web3.utils.toBN(await web3.eth.getGasPrice());

    console.log(`Actual gas price: ${gasPrice.div(web3.utils.toBN('1000000000'))} GWEI`);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`Gas price is low enough, let's rock!`);

  //   const contract = new web3.eth.Contract(abiFunctions as AbiItem[]) as unknown as EBlockStock;

  //   const deployCall = contract.deploy({
  //     data: artifact.bytecode,
  //     arguments: [superadmin],
  //   });

  //   const encodedABI = deployCall.encodeABI();

  //   const tx: TransactionConfig = {
  //     from: deployer.address,
  //     data: encodedABI,
  //     gasPrice: '30000000000',
  //     gas: 5000000,
  //   };

  //   console.log('TX has been created. Signin...');

  //   const signedTx = await web3.eth.accounts.signTransaction(tx, deployer.privateKey!);

  //   console.log('TX has been signed, sending contract to deploy');

  //   const contractDeploymentReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction as string);

  //   console.log(contractDeploymentReceipt);
}

getGasPrice()
  .then((e) => {
    console.log('DONE');
    console.log(e);
    // process.exit(0);
  })
  .catch((error) => {
    console.error('ERROR');
    console.error(error);
    // process.exit(1);
  });
