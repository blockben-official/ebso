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
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`,
  },
  abiExporter: {
    clear: true,
    flat: true,
  },
  networks: {
    hardhat: {
      blockGasLimit: 87500000000,
      allowUnlimitedContractSize: true,
      live: false,
      saveDeployments: true,
      tags: ['local'],
    },
    localhost: {
      allowUnlimitedContractSize: true,
      blockGasLimit: 87500000000,
      live: false,
      saveDeployments: true,
      tags: ['local'],
      url: 'http://127.0.0.1:8545/',
    },
    ropsten: {
      url: `${process.env.ETH_NODE_URI_ROPSTEN}`,
      accounts: [`${process.env.SUPERADMIN_ACCOUNT_ADDRESS_ROPSTEN}`],
      live: true,
      saveDeployments: true,
      tags: ['test', 'uat'],
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
    outDir: 'src/typechain',
    target: 'ethers-v5',
  },
};

export default config;
