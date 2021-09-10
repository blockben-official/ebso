import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 007: pause - unpause', () => {
  let EBSO: EBlockStock;
  let owner: SignerWithAddress;
  let superadmin: SignerWithAddress;
  let eBSOAdmin: SignerWithAddress;
  let amlAdmin: SignerWithAddress;
  let treasuryAdmin: SignerWithAddress;
  let user: SignerWithAddress;
  let addresses: SignerWithAddress[];

  const TOKEN_ADMIN = ethers.utils.id('TOKEN_ADMIN');
  const AML_ADMIN = ethers.utils.id('AML_ADMIN');
  const TREASURY_ADMIN = ethers.utils.id('TREASURY_ADMIN');

  beforeEach(async () => {
    [owner, superadmin, eBSOAdmin, amlAdmin, treasuryAdmin, user, ...addresses] = await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;

    await EBSO.grantRole(TOKEN_ADMIN, eBSOAdmin.address);
    await EBSO.grantRole(AML_ADMIN, amlAdmin.address);
    await EBSO.grantRole(TREASURY_ADMIN, treasuryAdmin.address);
  });

  it('the contract can be paused', async () => {
    await EBSO.pause();

    const isPaused = await EBSO.paused();

    expect(isPaused).to.eq(true);
  });

  it('pausing the contract should emit event', async () => {
    await expect(EBSO.pause()).to.emit(EBSO, 'Paused').withArgs(owner.address);
  });

  it('an eBSO admin should be able to pause the contract', async () => {
    await EBSO.connect(eBSOAdmin).pause();

    const isPaused = await EBSO.paused();

    expect(isPaused).to.eq(true);
  });

  it('superadmin should be able to pause the contract', async () => {
    await EBSO.connect(superadmin).pause();

    const isPaused = await EBSO.paused();

    expect(isPaused).to.eq(true);
  });

  it('an AML admin should not be able to pause the contract', async () => {
    await expect(EBSO.connect(amlAdmin).pause()).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to pause the contract', async () => {
    await expect(EBSO.connect(treasuryAdmin).pause()).to.be.revertedWith('missing role');
  });

  it('a simple user should not be able to pause the contract', async () => {
    await expect(EBSO.connect(user).pause()).to.be.revertedWith('missing role');
  });

  it('the contract can be unpaused', async () => {
    await EBSO.pause();
    await EBSO.unpause();

    const isPaused = await EBSO.paused();

    expect(isPaused).to.eq(false);
  });

  it('unpausing the contract should emit event', async () => {
    await EBSO.pause();

    await expect(EBSO.unpause()).to.emit(EBSO, 'Unpaused').withArgs(owner.address);
  });

  it('an eBSO admin should be able to unpause the contract', async () => {
    await EBSO.pause();
    await EBSO.connect(eBSOAdmin).unpause();

    const isPaused = await EBSO.paused();

    expect(isPaused).to.eq(false);
  });

  it('superadmin should be able to unpause the contract', async () => {
    await EBSO.pause();
    await EBSO.connect(superadmin).unpause();

    const isPaused = await EBSO.paused();

    expect(isPaused).to.eq(false);
  });

  it('an AML admin should not be able to unpause the contract', async () => {
    await EBSO.pause();

    await expect(EBSO.connect(amlAdmin).unpause()).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to unpause the contract', async () => {
    await EBSO.pause();

    await expect(EBSO.connect(treasuryAdmin).unpause()).to.be.revertedWith('missing role');
  });

  it('a simple user should not be able to unpause the contract', async () => {
    await EBSO.pause();

    await expect(EBSO.connect(user).unpause()).to.be.revertedWith('missing role');
  });

  it('an already paused contract cannot be paused again', async () => {
    await EBSO.pause();

    await expect(EBSO.pause()).to.be.revertedWith('Pausable: paused');
  });

  it('a not paused contract cannot be unpaused ', async () => {
    await expect(EBSO.unpause()).to.be.revertedWith('Pausable: not paused');
  });

  it('an already unpaused contract cannot be unpaused again', async () => {
    await EBSO.pause();
    await EBSO.unpause();

    await expect(EBSO.unpause()).to.be.revertedWith('Pausable: not paused');
  });
});
