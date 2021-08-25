import { ethers, run } from 'hardhat';
import { EBlockStock } from '../typechain';

const treasuryAddress = process.env.TREASURY_ADDRESS as string;
const eBsoAdminAddress = process.env.EBSO_ADMIN_ADDRESS as string;
const eBsoAddress = process.env.EBSO_ADDRESS as string;

async function setupTreasuryAddress() {
  await run('compile');

  const admin = await ethers.getSigner(eBsoAdminAddress);
  const eBSO = (await ethers.getContractAt('EBlockStock', eBsoAddress, admin)) as EBlockStock;

  await eBSO.setTreasuryAddress(treasuryAddress);

  console.log(`Treasuy address successfully set to: ${treasuryAddress}`);
}

(async () => {
  try {
    await setupTreasuryAddress();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
