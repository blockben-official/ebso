import { HardhatRuntimeEnvironment, HardhatUserConfig } from 'hardhat/types';
import { task } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-typechain';
import 'hardhat-gas-reporter';
import 'hardhat-log-remover';
import 'hardhat-abi-exporter';
import 'solidity-coverage';
import 'hardhat-deploy';
import 'dotenv/config';
import 'hardhat-contract-sizer';

task('accounts', 'Prints the list of accounts', async (args, hre: HardhatRuntimeEnvironment) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: {
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
    compilers: [
      {
        version: '0.8.4',
        settings: {},
      },
    ],
  },
  abiExporter: {
    clear: true,
    flat: true,
  },
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
      gas: 'auto',
      allowUnlimitedContractSize: true,
      live: false,
      saveDeployments: true,
      tags: ['local'],
    },
    localhost: {
      allowUnlimitedContractSize: true,
      blockGasLimit: 87500000000,
      minGasPrice: 0,
      live: false,
      saveDeployments: true,
      tags: ['local'],
      url: 'http://127.0.0.1:8545/',
    },
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  gasReporter: {
    currency: 'USD',
    outputFile: 'src/reports/gas-report.txt',
  },
  paths: {
    root: 'src',
    deployments: './src/deployments',
  },
  typechain: {
    outDir: 'src/typechain/web3',
    target: 'web3-v1',
  },
};

export default config;
