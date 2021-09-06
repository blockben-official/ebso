import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

/**
 * Test the kill functionality.
 *
 * Kill function has been removed in v0.0.2
 *
 * @deprecated since v0.0.2
 */
describe.skip('eBSO - 008: kill', () => {
  let EBSO: EBlockStock;
  let owner: SignerWithAddress;
  let superadmin: SignerWithAddress;
  let eBSOAdmin: SignerWithAddress;
  let amlAdmin: SignerWithAddress;
  let treasuryAdmin: SignerWithAddress;
  let cashOut: SignerWithAddress;
  let user: SignerWithAddress;
  let addresses: SignerWithAddress[];

  const EBSO_ADMIN = ethers.utils.id('EBSO_ADMIN');
  const AML_ADMIN = ethers.utils.id('AML_ADMIN');
  const TREASURY_ADMIN = ethers.utils.id('TREASURY_ADMIN');

  beforeEach(async () => {
    [owner, superadmin, eBSOAdmin, amlAdmin, treasuryAdmin, cashOut, user, ...addresses] = await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;

    await EBSO.grantRole(EBSO_ADMIN, eBSOAdmin.address);
    await EBSO.grantRole(AML_ADMIN, amlAdmin.address);
    await EBSO.grantRole(TREASURY_ADMIN, treasuryAdmin.address);
  });

  it('paused contract can be killed', async () => {
    await EBSO.pause();

    await EBSO.kill(cashOut.address);
  });

  it('not paused contract cannot be killed', async () => {
    await expect(EBSO.kill(cashOut.address)).to.be.revertedWith('Pausable: not paused');
  });

  it('an eBSO admin should be able to kill the contract', async () => {
    await EBSO.pause();

    await EBSO.connect(eBSOAdmin).kill(cashOut.address);
  });

  it('superadmin should be able to kill the contract', async () => {
    await EBSO.pause();

    await EBSO.connect(superadmin).kill(cashOut.address);
  });

  it('an AML admin should not be able to kill the contract', async () => {
    await EBSO.pause();

    await expect(EBSO.connect(amlAdmin).kill(cashOut.address)).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to kill the contract', async () => {
    await EBSO.pause();

    await expect(EBSO.connect(treasuryAdmin).kill(cashOut.address)).to.be.revertedWith('missing role');
  });

  it('a simple user should not be able to kill the contract', async () => {
    await EBSO.pause();

    await expect(EBSO.connect(user).kill(cashOut.address)).to.be.revertedWith('missing role');
  });
});
